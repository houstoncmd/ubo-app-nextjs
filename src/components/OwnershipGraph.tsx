"use client";

import { useEffect, useRef, useState, useCallback } from "react";


/* ================================================================
   Types matching the graph data shape from the API
   ================================================================ */
interface GraphNode {
  id: string;
  label: string;
  full_name?: string;
  reg_id?: string;
  type: string;
  level: number;
  is_ubo?: boolean;
  is_investigation?: boolean;
  effective_pct?: number;
  color?: { background: string; border: string };
  shape?: string;
  size?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  width?: number;
  arrows?: string;
  color?: { color: string; highlight: string };
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface OwnershipGraphProps {
  data: GraphData;
}

/* ================================================================
   OwnershipGraph Component
   Interactive vis-network graph with:
   - Level selector buttons
   - Entity filter dropdown
   - Physics toggle
   - Fullscreen mode
   - Graph legend
   ================================================================ */
export default function OwnershipGraph({ data }: OwnershipGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const nodeDataMapRef = useRef<Record<string, GraphNode>>({});
  const adjacencyMapRef = useRef<Record<string, string[]>>({});
  const graphDataRef = useRef<GraphData>(data);

  const [maxLevel, setMaxLevel] = useState(0);
  const [selectedMaxLevel, setSelectedMaxLevel] = useState(2);
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [entityFilter, setEntityFilter] = useState("");
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Refs for fullscreen
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenNetworkRef = useRef<any>(null);

  // Initialize graph on mount
  useEffect(() => {
    if (!containerRef.current || !data || !data.nodes || data.nodes.length === 0) return;

    let cancelled = false;

    async function init() {
      const vis = await import("vis-network/standalone");
      if (cancelled || !containerRef.current) return;

      graphDataRef.current = data;

      // Build node data map and find max level
      const nodeMap: Record<string, GraphNode> = {};
      let ml = 0;
      data.nodes.forEach((n) => {
        nodeMap[n.id] = n;
        if (n.level > ml) ml = n.level;
      });
      nodeDataMapRef.current = nodeMap;
      setMaxLevel(ml);

      // Build adjacency map for path tracing
      const adj: Record<string, string[]> = {};
      data.edges.forEach((e) => {
        if (!adj[e.to]) adj[e.to] = [];
        adj[e.to].push(e.from);
      });
      adjacencyMapRef.current = adj;

      // Build UBO node IDs set
      const uboNodeIds = new Set<string>();
      data.nodes.forEach((n) => {
        if (n.is_ubo) uboNodeIds.add(n.id);
      });

      // Create vis DataSet for nodes
      const nodes = new vis.DataSet(
        data.nodes.map((node: GraphNode) => {
          const name = node.full_name || node.label || "";
          const rid = node.reg_id || "";
          const multiLabel = name + "\n" + rid;

          const tooltipLines = [name];
          if (rid && rid !== name) tooltipLines.push("ID: " + rid);
          if (node.type === "company") tooltipLines.push("Company");
          else tooltipLines.push("Person");
          if (node.effective_pct) tooltipLines.push("Effective: " + node.effective_pct.toFixed(2) + "%");
          if (node.is_investigation) tooltipLines.push("⚠ Investigation needed");
          const tooltip = tooltipLines.join("\n");

          const baseSize = node.shape === "box" ? 35 : 20;
          const nodeSize = Math.max(baseSize, node.size || 25);

          return {
            id: node.id,
            label: multiLabel,
            color: node.color || {
              background: node.type === "company" ? "#3b82f6" : "#22c55e",
              border: node.type === "company" ? "#1e40af" : "#16a34a",
            },
            shape: node.shape || (node.type === "company" ? "box" : "dot"),
            size: nodeSize,
            font: {
              color: "#ffffff",
              size: 11,
              multi: "md" as const,
              face: "Tahoma, Arial, sans-serif",
              strokeWidth: 2,
              strokeColor: node.color ? node.color.background : "#333",
            },
            title: tooltip,
            level: node.level || 0,
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
          } as any;
        })
      );

      // Create vis DataSet for edges
      const edges = new vis.DataSet(
        data.edges.map((edge: GraphEdge) => {
          const connectsToUBO = uboNodeIds.has(edge.from) || uboNodeIds.has(edge.to);
          return {
            from: edge.from,
            to: edge.to,
            label: edge.label || "",
            width: connectsToUBO ? Math.max(2, edge.width || 2) : (edge.width || 2),
            arrows: edge.arrows || "to",
            color: connectsToUBO
              ? { color: "#ef4444", highlight: "#dc2626", opacity: 0.8 }
              : edge.color || { color: "#94a3b8", highlight: "#3b82f6" },
            font: { size: 10, align: "middle" as const, color: "#333" },
            smooth: { type: "cubicBezier" as const, roundness: 0.3 },
          } as any;
        }) as any[]
      );

      // Graph options matching the original design
      const options = {
        physics: {
          enabled: true,
          solver: "forceAtlas2Based" as const,
          forceAtlas2Based: {
            gravitationalConstant: -120,
            centralGravity: 0.01,
            springLength: 250,
            springConstant: 0.05,
            damping: 0.4,
          },
          stabilization: { iterations: 200, fit: true },
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          zoomView: true,
          dragView: true,
          multiselect: false,
          navigationButtons: false,
          keyboard: false,
        },
        nodes: {
          borderWidth: 2,
          borderWidthSelected: 3,
          shadow: { enabled: true, color: "rgba(0,0,0,0.1)", size: 10 },
          margin: 10,
          widthConstraint: { minimum: 80, maximum: 200 },
        },
        edges: {
          smooth: { type: "cubicBezier" as const, roundness: 0.3 },
          shadow: false,
        },
        layout: { hierarchical: false, improvedLayout: true },
      };

      const network = new vis.Network(containerRef.current, { nodes: nodes as any, edges: edges as any }, options as any);

      // After stabilization, disable physics
      network.on("stabilizationIterationsDone", () => {
        network.setOptions({ physics: { enabled: false } });
        setPhysicsEnabled(false);
      });

      networkRef.current = network;

      // Default level filter to 0-2
      setTimeout(() => {
        applyLevelFilter(2);
      }, 100);
    }

    init();

    return () => {
      cancelled = true;
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [data]);

  // Apply level filter to the network
  const applyLevelFilter = useCallback(
    (level: number) => {
      const network = networkRef.current;
      if (!network) return;

      network.body.data.nodes.forEach((node: any) => {
        const nd = nodeDataMapRef.current[node.id];
        if (nd) {
          const visible = level === 99 || nd.level <= level;
          network.body.data.nodes.update({ id: node.id, hidden: !visible });
        }
      });
      network.body.data.edges.forEach((edge: any) => {
        const fromNd = nodeDataMapRef.current[edge.from];
        const toNd = nodeDataMapRef.current[edge.to];
        const visible =
          (level === 99 || !fromNd || fromNd.level <= level) &&
          (level === 99 || !toNd || toNd.level <= level);
        network.body.data.edges.update({ id: edge.id, hidden: !visible });
      });
    },
    []
  );

  // Handle level selector change
  const handleLevelChange = useCallback(
    (level: number) => {
      setSelectedMaxLevel(level);
      applyLevelFilter(level);
    },
    [applyLevelFilter]
  );

  // Toggle physics
  const togglePhysics = useCallback(() => {
    const network = networkRef.current;
    if (!network) return;
    const newState = !physicsEnabled;
    setPhysicsEnabled(newState);
    network.setOptions({ physics: { enabled: newState } });
  }, [physicsEnabled]);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    const network = networkRef.current;
    if (!network) return;
    network.fit({ animation: { duration: 500, easingFunction: "easeInOutQuad" } });
  }, []);

  // Entity highlight
  const handleEntityHighlight = useCallback(
    (entityId: string) => {
      setEntityFilter(entityId);
      const network = networkRef.current;
      if (!network || !graphDataRef.current) return;

      if (!entityId) {
        // Reset all to full opacity
        network.body.data.nodes.forEach((node: any) => {
          const nd = nodeDataMapRef.current[node.id];
          if (nd) {
            network.body.data.nodes.update({
              id: node.id,
              opacity: 1,
              color: nd.color,
              borderWidth: 2,
            });
          }
        });
        network.body.data.edges.forEach((edge: any) => {
          const fromNd = nodeDataMapRef.current[edge.from];
          const toNd = nodeDataMapRef.current[edge.to];
          const connectsToUBO = (fromNd && fromNd.is_ubo) || (toNd && toNd.is_ubo);
          network.body.data.edges.update({
            id: edge.id,
            color: connectsToUBO
              ? { color: "#ef4444", highlight: "#dc2626", opacity: 0.8 }
              : { color: "#94a3b8", highlight: "#3b82f6" },
            width: connectsToUBO ? Math.max(2, 2) : 2,
            opacity: 1,
          });
        });
        return;
      }

      // Trace connected nodes
      const connectedNodes = new Set<string>();
      const connectedEdges = new Set<string>();

      function traceUp(nodeId: string) {
        connectedNodes.add(nodeId);
        const nd = nodeDataMapRef.current[nodeId];
        if (!nd || nd.level === 0) return;
        graphDataRef.current.edges.forEach((e) => {
          if (e.from === nodeId) {
            connectedEdges.add(e.from + "->" + e.to);
            traceUp(e.to);
          }
        });
      }

      function traceDown(nodeId: string) {
        connectedNodes.add(nodeId);
        graphDataRef.current.edges.forEach((e) => {
          if (e.to === nodeId && !connectedEdges.has(e.from + "->" + e.to)) {
            connectedEdges.add(e.from + "->" + e.to);
            traceDown(e.from);
          }
        });
      }

      traceUp(entityId);
      traceDown(entityId);

      // Apply opacity
      network.body.data.nodes.forEach((node: any) => {
        const nd = nodeDataMapRef.current[node.id];
        if (!nd) return;
        if (connectedNodes.has(node.id)) {
          const isTarget = node.id === entityId;
          network.body.data.nodes.update({
            id: node.id,
            opacity: 1,
            borderWidth: isTarget ? 4 : 2,
            color: isTarget
              ? { background: "#f59e0b", border: "#d97706" }
              : nd.color,
          });
        } else {
          network.body.data.nodes.update({
            id: node.id,
            opacity: 0.1,
            borderWidth: 1,
          });
        }
      });

      network.body.data.edges.forEach((edge: any) => {
        const edgeKey = edge.from + "->" + edge.to;
        if (connectedEdges.has(edgeKey)) {
          network.body.data.edges.update({
            id: edge.id,
            opacity: 1,
            width: 3,
          });
        } else {
          network.body.data.edges.update({
            id: edge.id,
            opacity: 0.03,
            width: 1,
          });
        }
      });
    },
    []
  );

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setShowFullscreen((prev) => !prev);
  }, []);

  // Initialize fullscreen network
  useEffect(() => {
    if (!showFullscreen || !fullscreenContainerRef.current) return;

    let cancelled = false;

    async function initFullscreen() {
      const vis = await import("vis-network/standalone");
      if (cancelled || !fullscreenContainerRef.current) return;

      const graphData = graphDataRef.current;
      if (!graphData) return;

      const uboNodeIds = new Set<string>();
      graphData.nodes.forEach((n) => {
        if (n.is_ubo) uboNodeIds.add(n.id);
      });

      const nodes = new vis.DataSet(
        graphData.nodes.map((node) => {
          const name = node.full_name || node.label || "";
          const rid = node.reg_id || "";
          return {
            id: node.id,
            label: name + "\n" + rid,
            color: node.color || {
              background: node.type === "company" ? "#3b82f6" : "#22c55e",
              border: node.type === "company" ? "#1e40af" : "#16a34a",
            },
            shape: node.shape || (node.type === "company" ? "box" : "dot"),
            size: Math.max(node.shape === "box" ? 35 : 20, node.size || 25),
            font: {
              color: "#ffffff",
              size: 11,
              multi: "md" as const,
              face: "Tahoma, Arial, sans-serif",
              strokeWidth: 2,
              strokeColor: node.color ? node.color.background : "#333",
            },
            title: name,
            level: node.level || 0,
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
          } as any;
        })
      );

      const edges = new vis.DataSet(
        graphData.edges.map((edge) => {
          const connectsToUBO = uboNodeIds.has(edge.from) || uboNodeIds.has(edge.to);
          return {
            from: edge.from,
            to: edge.to,
            label: edge.label || "",
            width: connectsToUBO ? Math.max(2, edge.width || 2) : (edge.width || 2),
            arrows: edge.arrows || "to",
            color: connectsToUBO
              ? { color: "#ef4444", highlight: "#dc2626", opacity: 0.8 }
              : edge.color || { color: "#94a3b8", highlight: "#3b82f6" },
            font: { size: 10, align: "middle" as const, color: "#333" },
            smooth: { type: "cubicBezier" as const, roundness: 0.3 },
          } as any;
        }) as any[]
      );

      const network = new vis.Network(
        fullscreenContainerRef.current,
        { nodes: nodes as any, edges: edges as any },
        {          physics: {
            enabled: false,
            solver: "forceAtlas2Based" as const,
            forceAtlas2Based: {
              gravitationalConstant: -120,
              centralGravity: 0.01,
              springLength: 250,
              springConstant: 0.05,
              damping: 0.4,
            },
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true,
          },
          nodes: {
            borderWidth: 2,
            shadow: { enabled: true, color: "rgba(0,0,0,0.1)", size: 10 },
            margin: 10,
            widthConstraint: { minimum: 80, maximum: 200 },
          },
          edges: {
            smooth: { type: "cubicBezier" as const, roundness: 0.3 },
            shadow: false,
          },
          layout: { hierarchical: false, improvedLayout: true },
        } as any
      );

      fullscreenNetworkRef.current = network;

      // Handle Escape key
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setShowFullscreen(false);
      };
      document.addEventListener("keydown", handleEsc);

      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    }

    initFullscreen();

    return () => {
      cancelled = true;
      if (fullscreenNetworkRef.current) {
        fullscreenNetworkRef.current.destroy();
        fullscreenNetworkRef.current = null;
      }
    };
  }, [showFullscreen]);

  // Build entity filter options (sorted: persons first)
  const entityOptions = data.nodes
    .slice()
    .sort((a, b) => {
      if (a.type === "personal" && b.type !== "personal") return -1;
      if (a.type !== "personal" && b.type === "personal") return 1;
      return (a.full_name || a.label || "").localeCompare(b.full_name || b.label || "");
    });

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "2rem" }}>
        <div className="empty-icon"><i className="bi bi-diagram-3" /></div>
        <p className="text-muted">No graph data available</p>
      </div>
    );
  }

  return (
    <>
      {/* Graph controls bar */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <div className="graph-controls">
          {/* Level selector */}
          <div className="btn-group" role="group" style={{ fontSize: "0.8rem" }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedMaxLevel === 99 ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleLevelChange(99)}
            >
              All
            </button>
            {Array.from({ length: maxLevel + 1 }, (_, i) => i).map((lv) => (
              <button
                key={lv}
                type="button"
                className={`btn btn-sm ${selectedMaxLevel === lv ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleLevelChange(lv)}
              >
                0-{lv}
              </button>
            ))}
          </div>

          {/* Entity filter */}
          <select
            className="form-select form-select-sm"
            style={{ width: "auto", minWidth: 160, fontSize: "0.75rem", padding: "0.2rem 0.5rem", height: "auto" }}
            value={entityFilter}
            onChange={(e) => handleEntityHighlight(e.target.value)}
          >
            <option value="">-- All nodes --</option>
            {entityOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.type === "personal" ? "👤" : "🏢"} {n.full_name || n.id}
                {n.is_ubo ? " [UBO]" : ""}
                {n.is_investigation ? " [!]" : ""}
              </option>
            ))}
          </select>

          {/* Clear highlight */}
          <button
            className="btn btn-sm btn-outline-secondary btn-icon"
            title="Clear"
            onClick={() => handleEntityHighlight("")}
          >
            <i className="bi bi-x-lg" />
          </button>

          {/* Fit to screen */}
          <button
            className="btn btn-sm btn-outline-primary btn-icon"
            title="Fit to Screen"
            onClick={fitToScreen}
          >
            <i className="bi bi-arrows-fullscreen" />
          </button>

          {/* Physics toggle */}
          <button
            className={`btn btn-sm ${physicsEnabled ? "btn-primary" : "btn-outline-primary"}`}
            title="Toggle Physics"
            onClick={togglePhysics}
          >
            <i className={`bi bi-toggle-${physicsEnabled ? "on" : "off"}`} />{" "}
            <span className="d-none d-md-inline">Physics</span>
          </button>

          {/* Fullscreen */}
          <button
            className="btn btn-sm btn-outline-danger btn-icon"
            title="Fullscreen"
            onClick={toggleFullscreen}
          >
            <i className="bi bi-box-arrow-up-right" />
          </button>
        </div>
      </div>

      {/* Graph container */}
      <div ref={containerRef} id="graph-container" />

      {/* Legend */}
      <div className="mt-2 graph-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "#1f2937" }} /> Main
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "#3b82f6" }} /> Company
        </span>
        <span className="legend-item">
          <span className="legend-dot circle" style={{ background: "#22c55e" }} /> Person
        </span>
        <span className="legend-item">
          <span className="legend-dot circle" style={{ background: "#ef4444" }} /> UBO
        </span>
        <span className="legend-item">
          <span
            className="legend-dot"
            style={{ background: "#1e40af", border: "2px solid #f59e0b" }}
          />{" "}
          Investigation
        </span>
        <span className="legend-item">
          <span className="legend-dot line" style={{ background: "#ef4444" }} /> UBO Path
        </span>
      </div>

      {/* Fullscreen overlay */}
      {showFullscreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1400,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
              background: "#fff",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <span className="fw-bold">
              <i className="bi bi-diagram-3 me-2" />
              Ownership Graph - Fullscreen
            </span>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => setShowFullscreen(false)}
            >
              <i className="bi bi-x-lg" /> Close
            </button>
          </div>
          <div
            ref={fullscreenContainerRef}
            style={{
              width: "100%",
              maxWidth: 1400,
              height: "calc(100vh - 60px)",
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "0 0 8px 8px",
            }}
          />
          {/* Floating legend in fullscreen */}
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.95)",
              padding: "8px 20px",
              borderRadius: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 10000,
              fontSize: "0.8rem",
            }}
          >
            <span className="me-3">
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "#1f2937",
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              />{" "}
              Main
            </span>
            <span className="me-3">
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "#3b82f6",
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              />{" "}
              Company
            </span>
            <span className="me-3">
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "#22c55e",
                  borderRadius: "50%",
                  verticalAlign: "middle",
                }}
              />{" "}
              Person
            </span>
            <span className="me-3">
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "#ef4444",
                  borderRadius: "50%",
                  verticalAlign: "middle",
                }}
              />{" "}
              UBO
            </span>
            <span className="me-3">
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "#1e40af",
                  border: "2px solid #f59e0b",
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              />{" "}
              Investigation
            </span>
          </div>
        </div>
      )}
    </>
  );
}
