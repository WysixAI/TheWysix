import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Maximize2,
  RotateCcw,
  Check,
  ZoomIn,
  ZoomOut,
  Sliders,
  Play,
  Layers,
  ArrowRight,
  Hammer,
  AlertTriangle,
  Settings2,
  Clock,
  Shield,
  MessageSquare,
  Palette,
  ExternalLink,
  Bot
} from 'lucide-react';
import {
  ActionFlow,
  ActionStep,
  ActionConnection,
  ActionStepType,
  ActionTriggerConfig
} from '../../types/guildConfig';
import { TOOLBOX_BLOCKS } from './BotGhostToolbox';
import { BotGhostEmbedPreview } from './BotGhostEmbedPreview';

interface BotGhostNodeCanvasProps {
  flow: ActionFlow;
  serverName: string;
  onUpdateFlow: (updater: (prev: ActionFlow) => ActionFlow) => void;
  onOpenTriggerModal: () => void;
  onOpenVariables: () => void;
  availableRoles: { id: string; name: string }[];
}

interface DraggingNodeRefState {
  nodeId: string;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
}

interface ConnectingState {
  fromNodeId: string;
  fromPort: 'default' | 'then' | 'else';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const DISCORD_COLOR_PRESETS = [
  { name: 'Blurple', hex: '#5865F2' },
  { name: 'Zielony', hex: '#57F287' },
  { name: 'Żółty', hex: '#FEE75C' },
  { name: 'Czerwony', hex: '#ED4245' },
  { name: 'Różowy', hex: '#EB459E' },
  { name: 'Fioletowy', hex: '#9B59B6' },
  { name: 'Ciemny', hex: '#1E1F22' }
];

export function BotGhostNodeCanvas({
  flow,
  serverName,
  onUpdateFlow,
  onOpenTriggerModal,
  onOpenVariables,
  availableRoles
}: BotGhostNodeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  // Stan płótna: pan & zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 120, y: 100 });
  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Płynne przesuwanie węzłów bez lagowania (lokalny offset w requestAnimationFrame)
  const draggingNodeRef = useRef<DraggingNodeRefState | null>(null);
  const [liveDragOffset, setLiveDragOffset] = useState<{ nodeId: string; dx: number; dy: number } | null>(null);

  // Tworzenie połączenia (kabla/linku) poziomego
  const connectingRef = useRef<ConnectingState | null>(null);
  const [connecting, setConnecting] = useState<ConnectingState | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; portType: 'in' } | null>(null);

  // Zaznaczony węzeł do edycji / boczny panel inspekcji (Customization Drawer)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Pozycje domyślne węzłów bazowych
  const triggerPos = flow.triggerPosition || { x: 80, y: 100 };
  const errorHandlerPos = flow.errorHandlerPosition || { x: 80, y: 380 };

  const NODE_WIDTH = 340;

  // Domyślne rozmieszczenie kroków w prawo (Left-to-Right layout)
  const getStepPosition = useCallback(
    (step: ActionStep, index: number) => {
      if (typeof step.x === 'number' && typeof step.y === 'number') {
        return { x: step.x, y: step.y };
      }
      return { x: 480 + index * 400, y: 100 };
    },
    []
  );

  // Pozycje z uwzględnieniem aktywnego przeciągania
  const getNodePosition = useCallback(
    (nodeId: string) => {
      let base = { x: 0, y: 0 };
      if (nodeId === 'trigger') {
        base = triggerPos;
      } else if (nodeId === 'error_handler') {
        base = errorHandlerPos;
      } else {
        const stepIndex = flow.steps.findIndex((s) => s.id === nodeId);
        if (stepIndex !== -1) {
          base = getStepPosition(flow.steps[stepIndex], stepIndex);
        }
      }

      if (liveDragOffset && liveDragOffset.nodeId === nodeId) {
        return {
          x: Math.round(base.x + liveDragOffset.dx),
          y: Math.round(base.y + liveDragOffset.dy)
        };
      }
      return base;
    },
    [triggerPos, errorHandlerPos, flow.steps, getStepPosition, liveDragOffset]
  );

  // Auto-inicjalizacja domyślnego połączenia z wyzwalaczem
  useEffect(() => {
    if ((!flow.connections || flow.connections.length === 0) && flow.steps.length > 0) {
      const defaultConns: ActionConnection[] = [
        {
          id: 'conn-trig-' + flow.steps[0].id,
          fromNodeId: 'trigger',
          fromPort: 'default',
          toNodeId: flow.steps[0].id
        }
      ];
      for (let i = 0; i < flow.steps.length - 1; i++) {
        defaultConns.push({
          id: `conn-${flow.steps[i].id}-${flow.steps[i + 1].id}`,
          fromNodeId: flow.steps[i].id,
          fromPort: 'default',
          toNodeId: flow.steps[i + 1].id
        });
      }
      onUpdateFlow((prev) => ({ ...prev, connections: defaultConns }));
    }
  }, [flow.steps.length]);

  // Obliczanie współrzędnych portów (PO PRAWEJ DLA WYJŚCIA, PO LEWEJ DLA WEJŚCIA)
  const getNodeCoordinates = useCallback(
    (nodeId: string) => {
      const pos = getNodePosition(nodeId);

      if (nodeId === 'trigger') {
        const height = 150;
        return {
          x: pos.x,
          y: pos.y,
          width: NODE_WIDTH,
          height,
          // Wyjście z prawej strony
          outputPortX: pos.x + NODE_WIDTH,
          outputPortY: pos.y + height / 2
        };
      }

      if (nodeId === 'error_handler') {
        const height = 120;
        return {
          x: pos.x,
          y: pos.y,
          width: NODE_WIDTH,
          height,
          // Wyjście z prawej strony
          outputPortX: pos.x + NODE_WIDTH,
          outputPortY: pos.y + height / 2
        };
      }

      const stepIndex = flow.steps.findIndex((s) => s.id === nodeId);
      if (stepIndex === -1) return null;
      const step = flow.steps[stepIndex];
      const height = step.collapsed ? 54 : 200;

      return {
        x: pos.x,
        y: pos.y,
        width: NODE_WIDTH,
        height,
        // Wejście z lewej strony
        inputPortX: pos.x,
        inputPortY: pos.y + height / 2,
        // Wyjście standardowe z prawej strony
        outputPortX: pos.x + NODE_WIDTH,
        outputPortY: pos.y + height / 2,
        // Porty warunku IF po prawej stronie
        thenPortX: pos.x + NODE_WIDTH,
        thenPortY: pos.y + (step.collapsed ? 27 : 65),
        elsePortX: pos.x + NODE_WIDTH,
        elsePortY: pos.y + (step.collapsed ? 27 : 135)
      };
    },
    [getNodePosition, flow.steps]
  );

  // Funkcja czystej poziomej krzywej Béziera (Zero-Lag Horizontal S-Curve)
  const calculateHorizontalBezier = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.max(60, Math.abs(x2 - x1) * 0.55);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // --- OBSŁUGA UPUSZCZANIA KLOCKÓW (DRAG & DROP Z PRZYBORNIKA) ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const typeStr = e.dataTransfer.getData('text/plain') as ActionStepType;
    if (!typeStr || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropX = Math.round((e.clientX - rect.left - pan.x) / zoom);
    const dropY = Math.round((e.clientY - rect.top - pan.y) / zoom);

    addNewStepAtPosition(typeStr, dropX - 170, dropY - 30);
  };

  const addNewStepAtPosition = (type: ActionStepType, posX: number, posY: number) => {
    const newStepId = 'step-' + Math.random().toString(36).substring(2, 9);
    const newStep: ActionStep = {
      id: newStepId,
      type,
      x: posX,
      y: posY,
      durationSeconds: type === 'wait' ? 2 : undefined,
      cooldownSeconds: type === 'cooldown' ? 10 : undefined,
      messageText:
        type === 'send_message' || type === 'send_ephemeral' || type === 'send_dm'
          ? 'Wiadomość bota: Cześć {user}!'
          : undefined,
      embedTitle: type === 'send_embed' ? '📌 Panel Informacyjny' : undefined,
      embedDescription: type === 'send_embed' ? 'Treść karty embed dla {user}' : undefined,
      embedColor: type === 'send_embed' ? '#5865F2' : undefined,
      roleName: type === 'give_role' || type === 'remove_role' ? 'Zweryfikowany' : undefined,
      conditionType: type === 'condition_if' ? 'has_role' : undefined,
      conditionValue: type === 'condition_if' ? 'Gracz' : undefined
    };

    onUpdateFlow((prev) => {
      const steps = [...prev.steps, newStep];
      const conns = [...(prev.connections || [])];
      // Jeśli to pierwszy krok, automatycznie połącz z prawego portu wyzwalacza
      if (steps.length === 1) {
        conns.push({
          id: 'conn-trig-' + newStepId,
          fromNodeId: 'trigger',
          fromPort: 'default',
          toNodeId: newStepId
        });
      }
      return { ...prev, steps, connections: conns };
    });

    setSelectedNodeId(newStepId);
    setIsInspectorOpen(true);
  };

  // --- MYSZ: PRZESUWANIE PŁÓTNA I WĘZŁÓW BEZ LAGÓW ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    const base = getNodePosition(nodeId);
    draggingNodeRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: base.x,
      initialY: base.y
    };

    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Panning płótna
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
      return;
    }

    // 2. Przeciąganie węzła (użycie requestAnimationFrame dla stałych 60/120 FPS bez re-renderu rodzica)
    if (draggingNodeRef.current) {
      const startX = draggingNodeRef.current.startX;
      const startY = draggingNodeRef.current.startY;
      const curX = e.clientX;
      const curY = e.clientY;
      const nid = draggingNodeRef.current.nodeId;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setLiveDragOffset({
          nodeId: nid,
          dx: (curX - startX) / zoom,
          dy: (curY - startY) / zoom
        });
      });
      return;
    }

    // 3. Przeciąganie kabla (linie Béziera natychmiast za kursorem)
    if (connectingRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currX = (e.clientX - rect.left - pan.x) / zoom;
      const currY = (e.clientY - rect.top - pan.y) / zoom;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setConnecting((prev) => (prev ? { ...prev, currentX: currX, currentY: currY } : null));
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);

    // Zatwierdź nową pozycję węzła TYLKO RAZ po zakończeniu przeciągania
    if (draggingNodeRef.current && liveDragOffset) {
      const { nodeId, initialX, initialY } = draggingNodeRef.current;
      const finalX = Math.round(initialX + liveDragOffset.dx);
      const finalY = Math.round(initialY + liveDragOffset.dy);

      if (nodeId === 'trigger') {
        onUpdateFlow((prev) => ({
          ...prev,
          triggerPosition: { x: finalX, y: finalY }
        }));
      } else if (nodeId === 'error_handler') {
        onUpdateFlow((prev) => ({
          ...prev,
          errorHandlerPosition: { x: finalX, y: finalY }
        }));
      } else {
        onUpdateFlow((prev) => ({
          ...prev,
          steps: prev.steps.map((st) => (st.id === nodeId ? { ...st, x: finalX, y: finalY } : st))
        }));
      }
    }

    draggingNodeRef.current = null;
    setLiveDragOffset(null);

    // Utwórz połączenie, jeśli upuszczono kabel nad lewym portem
    if (connecting && hoveredPort) {
      createConnection(connecting.fromNodeId, connecting.fromPort, hoveredPort.nodeId);
    }

    connectingRef.current = null;
    setConnecting(null);
    setHoveredPort(null);
  };

  // --- TWORZENIE POŁĄCZEŃ Z PRAWYCH PORTÓW ---
  const startConnecting = (
    e: React.MouseEvent,
    fromNodeId: string,
    fromPort: 'default' | 'then' | 'else',
    portX: number,
    portY: number
  ) => {
    e.stopPropagation();
    const connData: ConnectingState = {
      fromNodeId,
      fromPort,
      startX: portX,
      startY: portY,
      currentX: portX,
      currentY: portY
    };
    connectingRef.current = connData;
    setConnecting(connData);
  };

  const createConnection = (fromNodeId: string, fromPort: 'default' | 'then' | 'else', toNodeId: string) => {
    if (fromNodeId === toNodeId) return;

    onUpdateFlow((prev) => {
      const currentConns = prev.connections || [];
      const filtered = currentConns.filter(
        (c) => !(c.fromNodeId === fromNodeId && c.fromPort === fromPort && c.toNodeId === toNodeId)
      );
      const newConn: ActionConnection = {
        id: `conn-${fromNodeId}-${fromPort}-${toNodeId}`,
        fromNodeId,
        fromPort,
        toNodeId
      };
      return { ...prev, connections: [...filtered, newConn] };
    });
  };

  const deleteConnection = (connId: string) => {
    onUpdateFlow((prev) => ({
      ...prev,
      connections: (prev.connections || []).filter((c) => c.id !== connId)
    }));
  };

  // Aktywny krok zaznaczony do kastomizacji
  const selectedStep = flow.steps.find((s) => s.id === selectedNodeId);
  const isTriggerSelected = selectedNodeId === 'trigger';

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full min-h-[680px] flex-1 bg-[#101116] overflow-hidden select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle, #2d2e3b 1px, transparent 1px)`,
        backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* PŁYWAJĄCY PASEK NARZĘDZI (BOTTOM-LEFT TOOLBAR) */}
      <div className="absolute bottom-6 left-6 z-40 flex items-center gap-1.5 p-1.5 bg-[#171821]/95 backdrop-blur-md rounded-2xl border border-[#2d2e3b] shadow-2xl">
        <button
          onClick={() => setPan({ x: 120, y: 100 })}
          title="Dopasuj do ekranu (Fit View)"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-[#2d2e3b]" />
        <button
          onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
          title="Oddal (Zoom Out)"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono font-bold text-neutral-300 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}
          title="Przybliż (Zoom In)"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-[#2d2e3b]" />
        <button
          onClick={() => {
            // Ułóż węzły w płynnym poziomym szyku od lewej do prawej
            onUpdateFlow((prev) => ({
              ...prev,
              triggerPosition: { x: 80, y: 100 },
              errorHandlerPosition: { x: 80, y: 380 },
              steps: prev.steps.map((st, i) => ({
                ...st,
                x: 480 + i * 400,
                y: 100
              }))
            }));
            setPan({ x: 80, y: 100 });
          }}
          title="Uporządkuj w poziomie (Horizontal Auto-Layout)"
          className="px-2.5 py-1 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Auto Layout</span>
        </button>
      </div>

      {/* WARSTWA WIRTUALNEGO PŁÓTNA */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: '5000px',
          height: '5000px',
          top: 0,
          left: 0
        }}
      >
        {/* WARSTWA SVG: KABLE POZIOME (HORIZONTAL BEZIER CABLES) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5865F2" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="thenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="elseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* RYSOWANIE ISTNIEJĄCYCH POŁĄCZEŃ */}
          {(flow.connections || []).map((conn) => {
            const fromCoords = getNodeCoordinates(conn.fromNodeId);
            const toCoords = getNodeCoordinates(conn.toNodeId);
            if (!fromCoords || !toCoords) return null;

            let startX = fromCoords.outputPortX;
            let startY = fromCoords.outputPortY;
            let strokeColor = 'url(#cableGradient)';

            if (conn.fromPort === 'then') {
              startX = fromCoords.thenPortX || startX;
              startY = fromCoords.thenPortY || startY;
              strokeColor = 'url(#thenGradient)';
            } else if (conn.fromPort === 'else') {
              startX = fromCoords.elsePortX || startX;
              startY = fromCoords.elsePortY || startY;
              strokeColor = 'url(#elseGradient)';
            }

            const endX = toCoords.inputPortX || toCoords.x;
            const endY = toCoords.inputPortY || toCoords.y + toCoords.height / 2;

            const pathD = calculateHorizontalBezier(startX, startY, endX, endY);
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            return (
              <g key={conn.id} className="group pointer-events-auto">
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="cursor-pointer"
                  onClick={() => deleteConnection(conn.id)}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3.5"
                  filter="url(#glow)"
                  className="transition-all group-hover:stroke-rose-400 group-hover:stroke-[4.5px]"
                />
                <g
                  transform={`translate(${midX}, ${midY})`}
                  onClick={() => deleteConnection(conn.id)}
                  className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <circle r="12" fill="#14151a" stroke="#f43f5e" strokeWidth="2" />
                  <text textAnchor="middle" dy="4" fill="#f43f5e" fontSize="12" fontWeight="bold">
                    ✕
                  </text>
                </g>
              </g>
            );
          })}

          {/* RYSOWANIE KABLA W TRAKCIE PRZECIĄGANIA (POZIOMA KRZYWA BEZIERA) */}
          {connecting && (
            <path
              d={calculateHorizontalBezier(
                connecting.startX,
                connecting.startY,
                connecting.currentX,
                connecting.currentY
              )}
              fill="none"
              stroke={
                connecting.fromPort === 'then'
                  ? 'url(#thenGradient)'
                  : connecting.fromPort === 'else'
                  ? 'url(#elseGradient)'
                  : 'url(#cableGradient)'
              }
              strokeWidth="4"
              strokeDasharray="6 4"
              filter="url(#glow)"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* =============================================================== */}
        {/* 1. WĘZEŁ WYZWALACZA (TRIGGER NODE - Z PRAWYM PORTEM)             */}
        {/* =============================================================== */}
        {(() => {
          const pos = getNodePosition('trigger');
          const isSelected = selectedNodeId === 'trigger';
          return (
            <div
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: `${NODE_WIDTH}px`
              }}
              onClick={() => {
                setSelectedNodeId('trigger');
                setIsInspectorOpen(true);
              }}
              className={`absolute z-20 rounded-2xl bg-[#1d1e26] border shadow-2xl overflow-visible select-none transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#5865F2] ring-2 ring-[#5865F2]/40 shadow-[#5865F2]/20'
                  : 'border-[#2d2f3b] hover:border-amber-500/50'
              }`}
            >
              <div
                onMouseDown={(e) => handleNodeMouseDown(e, 'trigger')}
                className="p-4 cursor-grab active:cursor-grabbing flex items-start gap-3 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black shrink-0 shadow-md shadow-amber-950/40">
                  <Hammer className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-white tracking-tight">
                      Command Trigger
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId('trigger');
                        setIsInspectorOpen(true);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] font-bold"
                    >
                      Edytuj
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Uruchamia się po wywołaniu{' '}
                    <span className="font-mono text-amber-400 font-bold">
                      /{flow.trigger.commandName || 'komenda'}
                    </span>
                  </p>
                </div>
              </div>

              {/* PRAWY PORT WYJŚCIOWY (RIGHT SOCKET) */}
              <button
                onMouseDown={(e) =>
                  startConnecting(e, 'trigger', 'default', pos.x + NODE_WIDTH, pos.y + 75)
                }
                title="Przeciągnij kabel z prawego portu do klocka akcji"
                className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#5865F2] hover:bg-[#7289da] border-2 border-[#101116] shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
              >
                <div className="w-2 h-2 rounded-full bg-white shadow" />
              </button>
            </div>
          );
        })()}

        {/* =============================================================== */}
        {/* 2. WĘZEŁ ERROR HANDLER (Z PRAWYM PORTEM)                        */}
        {/* =============================================================== */}
        {(() => {
          const pos = getNodePosition('error_handler');
          const isSelected = selectedNodeId === 'error_handler';
          return (
            <div
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: `${NODE_WIDTH}px`
              }}
              onClick={() => setSelectedNodeId('error_handler')}
              className={`absolute z-20 rounded-2xl bg-[#1d1e26] border shadow-2xl overflow-visible select-none transition-all cursor-pointer ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-500/40'
                  : 'border-[#2d2f3b] hover:border-red-500/50'
              }`}
            >
              <div
                onMouseDown={(e) => handleNodeMouseDown(e, 'error_handler')}
                className="p-4 cursor-grab active:cursor-grabbing flex items-start gap-3 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-950/40">
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-black text-white tracking-tight">Error Handler</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Obsługa wyjątków i błędów w trakcie wykonywania akcji
                  </p>
                </div>
              </div>

              {/* PRAWY PORT WYJŚCIOWY */}
              <button
                onMouseDown={(e) =>
                  startConnecting(e, 'error_handler', 'default', pos.x + NODE_WIDTH, pos.y + 60)
                }
                title="Przeciągnij kabel z Error Handlera do klocka odpowiedzi o błędzie"
                className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-400 border-2 border-[#101116] shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
              >
                <div className="w-2 h-2 rounded-full bg-white shadow" />
              </button>
            </div>
          );
        })()}

        {/* =============================================================== */}
        {/* 3. WĘZŁY KROKÓW / AKCJI (ACTION STEPS)                          */}
        {/* =============================================================== */}
        {flow.steps.map((step, index) => {
          const pos = getNodePosition(step.id);
          const blockDef = TOOLBOX_BLOCKS.find((b) => b.type === step.type) || {
            title: step.type,
            desc: 'Akcja przepływu',
            icon: Sparkles
          };
          const StepIcon = blockDef.icon;
          const isSelected = selectedNodeId === step.id;
          const height = step.collapsed ? 54 : 190;

          return (
            <div
              key={step.id}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: `${NODE_WIDTH}px`
              }}
              onClick={() => {
                setSelectedNodeId(step.id);
                setIsInspectorOpen(true);
              }}
              className={`absolute z-20 rounded-2xl bg-[#1d1e26] border shadow-2xl overflow-visible select-none transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#5865F2] ring-2 ring-[#5865F2]/40 shadow-[#5865F2]/20'
                  : 'border-[#2d2f3b] hover:border-neutral-500'
              }`}
            >
              {/* LEWY PORT WEJŚCIOWY (LEFT INPUT SOCKET) */}
              <div
                onMouseEnter={() => setHoveredPort({ nodeId: step.id, portType: 'in' })}
                onMouseLeave={() => setHoveredPort(null)}
                title="Port wejściowy (upuść kabel tutaj)"
                className={`absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-[#101116] shadow-xl flex items-center justify-center transition-all z-30 cursor-pointer ${
                  hoveredPort?.nodeId === step.id
                    ? 'bg-emerald-400 scale-125 ring-4 ring-emerald-500/40 animate-pulse'
                    : 'bg-[#5865F2] hover:bg-[#7289da]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white shadow" />
              </div>

              {/* NAGŁÓWEK KLOCKA */}
              <div
                onMouseDown={(e) => handleNodeMouseDown(e, step.id)}
                className="p-3.5 flex items-start justify-between rounded-t-2xl cursor-grab active:cursor-grabbing border-b border-[#272833] gap-2.5"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-md">
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-white truncate">
                      {step.type === 'send_embed' ? 'Embed Reply' : blockDef.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                      {step.type === 'send_embed' ? 'Odpowiedź z kartą embed' : blockDef.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setSelectedNodeId(step.id);
                      setIsInspectorOpen(true);
                    }}
                    title="Otwórz pełny edytor właściwości"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onUpdateFlow((prev) => ({
                        ...prev,
                        steps: prev.steps.map((s) => (s.id === step.id ? { ...s, collapsed: !s.collapsed } : s))
                      }))
                    }
                    title={step.collapsed ? 'Rozwiń' : 'Zwiń'}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                  >
                    {step.collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      onUpdateFlow((prev) => ({
                        ...prev,
                        steps: prev.steps.filter((s) => s.id !== step.id),
                        connections: (prev.connections || []).filter(
                          (c) => c.fromNodeId !== step.id && c.toNodeId !== step.id
                        )
                      }));
                    }}
                    title="Usuń klocek"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SZYBKI PODGLĄD ZAWARTOŚCI */}
              {!step.collapsed && (
                <div className="p-3 space-y-2 bg-[#15161d] text-xs rounded-b-2xl">
                  {step.type === 'send_message' && (
                    <div className="text-[11px] text-neutral-300 line-clamp-2 bg-[#0f1015] p-2 rounded-lg border border-[#262732] font-mono">
                      {step.messageText || 'Brak treści wiadomości'}
                    </div>
                  )}

                  {step.type === 'send_embed' && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0f1015] border border-[#262732]">
                      <div
                        className="w-2 h-7 rounded"
                        style={{ backgroundColor: step.embedColor || '#5865F2' }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-[11px] truncate">
                          {step.embedTitle || 'Tytuł Embed'}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {step.embedDescription || 'Opis embedu...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {step.type === 'condition_if' && (
                    <div className="flex items-center justify-between text-[11px] text-neutral-300 p-2 rounded-lg bg-[#0f1015] border border-purple-500/20">
                      <span>Typ: {step.conditionType || 'has_role'}</span>
                      <span className="font-bold text-purple-400">{step.conditionValue || 'Gracz'}</span>
                    </div>
                  )}

                  {step.type === 'wait' && (
                    <div className="text-[11px] text-amber-300 p-2 rounded-lg bg-[#0f1015] border border-amber-500/20 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Czekaj: {step.durationSeconds || 2} sek.</span>
                    </div>
                  )}

                  {step.type === 'give_role' && (
                    <div className="text-[11px] text-sky-300 p-2 rounded-lg bg-[#0f1015] border border-sky-500/20 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Rola: {step.roleName || 'Gracz'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* PRAWE PORTY WYJŚCIOWE */}
              {step.type === 'condition_if' ? (
                <>
                  {/* Port THEN (Zielony po prawej u góry) */}
                  <div
                    style={{ top: step.collapsed ? '27px' : '65px' }}
                    className="absolute -right-3.5 -translate-y-1/2 flex items-center gap-1"
                  >
                    <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded border border-emerald-500/30">
                      THEN
                    </span>
                    <button
                      onMouseDown={(e) =>
                        startConnecting(
                          e,
                          step.id,
                          'then',
                          pos.x + NODE_WIDTH,
                          pos.y + (step.collapsed ? 27 : 65)
                        )
                      }
                      title="Kabel THEN (Gdy warunek spełniony)"
                      className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-[#101116] shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
                    >
                      <Check className="w-3.5 h-3.5 text-[#101116] stroke-[3]" />
                    </button>
                  </div>

                  {/* Port ELSE (Czerwony po prawej u dołu) */}
                  <div
                    style={{ top: step.collapsed ? '27px' : '135px' }}
                    className="absolute -right-3.5 -translate-y-1/2 flex items-center gap-1"
                  >
                    <span className="text-[9px] font-black uppercase text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded border border-rose-500/30">
                      ELSE
                    </span>
                    <button
                      onMouseDown={(e) =>
                        startConnecting(
                          e,
                          step.id,
                          'else',
                          pos.x + NODE_WIDTH,
                          pos.y + (step.collapsed ? 27 : 135)
                        )
                      }
                      title="Kabel ELSE (W przeciwnym razie)"
                      className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-[#101116] shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
                    >
                      <X className="w-3.5 h-3.5 text-[#101116] stroke-[3]" />
                    </button>
                  </div>
                </>
              ) : (
                /* Zwykły port wyjściowy po prawej stronie */
                <button
                  onMouseDown={(e) =>
                    startConnecting(
                      e,
                      step.id,
                      'default',
                      pos.x + NODE_WIDTH,
                      pos.y + height / 2
                    )
                  }
                  title="Przeciągnij kabel z prawego portu do kolejnego klocka"
                  className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#5865F2] hover:bg-[#7289da] border-2 border-[#101116] shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-white stroke-[3]" />
                </button>
              )}
            </div>
          );
        })}

        {/* KARTA ZAPROSZENIA, GDY NIE MA ŻADNYCH KROKÓW W PRZEPŁYWIE */}
        {flow.steps.length === 0 && (
          <div
            style={{ transform: `translate(480px, 100px)` }}
            className="absolute z-10 w-96 p-6 rounded-3xl bg-[#171821]/80 border-2 border-dashed border-[#2d2e3b] flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-white tracking-tight">Dodaj pierwszą akcję</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              Przeciągnij klocek z przybornika po lewej lub kliknij poniżej, aby wysłać wiadomość.
            </p>
            <button
              onClick={() => addNewStepAtPosition('send_message', 480, 100)}
              className="mt-4 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Dodaj klocek Wiadomości</span>
            </button>
          </div>
        )}
      </div>

      {/* =============================================================== */}
      {/* BOCZNY PANEL INSPEKCJI / KASTOMIZACJI WĘZŁA (INSPECTOR DRAWER)   */}
      {/* =============================================================== */}
      {isInspectorOpen && (
        <aside
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 bottom-0 w-96 z-50 bg-[#161720]/95 backdrop-blur-xl border-l border-[#2c2d3a] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        >
          {/* Nagłówek Drawer */}
          <div className="p-4 border-b border-[#2c2d3a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#5865F2]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isTriggerSelected ? 'Ustawienia Wyzwalacza' : 'Właściwości Klocka'}
              </h3>
            </div>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ciało kastomizacji */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Kastomizacja Wyzwalacza */}
            {isTriggerSelected && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Nazwa komendy slash
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-amber-400">
                      /
                    </span>
                    <input
                      type="text"
                      value={flow.trigger.commandName || ''}
                      onChange={(e) =>
                        onUpdateFlow((prev) => ({
                          ...prev,
                          trigger: {
                            ...prev.trigger,
                            commandName: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                          }
                        }))
                      }
                      placeholder="np. pomoc"
                      className="w-full pl-7 pr-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white font-mono focus:outline-none focus:border-[#5865F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Opis komendy
                  </label>
                  <input
                    type="text"
                    value={flow.trigger.commandDescription || ''}
                    onChange={(e) =>
                      onUpdateFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, commandDescription: e.target.value }
                      }))
                    }
                    placeholder="np. Wyświetla listę pomocy..."
                    className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white focus:outline-none focus:border-[#5865F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Cooldown (Czas odnowienia)
                  </label>
                  <select
                    value={flow.trigger.cooldownSeconds || 0}
                    onChange={(e) =>
                      onUpdateFlow((prev) => ({
                        ...prev,
                        trigger: { ...prev.trigger, cooldownSeconds: Number(e.target.value) }
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white cursor-pointer"
                  >
                    <option value={0}>Brak opóźnienia (0s)</option>
                    <option value={3}>3 sekundy</option>
                    <option value={5}>5 sekund</option>
                    <option value={10}>10 sekund</option>
                    <option value={30}>30 sekund</option>
                    <option value={60}>1 minuta</option>
                  </select>
                </div>
              </div>
            )}

            {/* Kastomizacja Kroków Akcji */}
            {selectedStep && (
              <div className="space-y-4">
                {/* 1. Treść wiadomości tekstowej */}
                {(selectedStep.type === 'send_message' ||
                  selectedStep.type === 'send_ephemeral' ||
                  selectedStep.type === 'send_dm') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-neutral-300 uppercase">
                        Treść wiadomości
                      </label>
                      <button
                        onClick={onOpenVariables}
                        className="text-[10px] text-[#8590ff] font-bold hover:underline"
                      >
                        + Zmienne
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={selectedStep.messageText || ''}
                      onChange={(e) =>
                        onUpdateFlow((prev) => ({
                          ...prev,
                          steps: prev.steps.map((s) =>
                            s.id === selectedStep.id ? { ...s, messageText: e.target.value } : s
                          )
                        }))
                      }
                      placeholder="Wpisz treść wiadomości bota..."
                      className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white focus:outline-none focus:border-[#5865F2]"
                    />

                    {/* Szybkie wstawianie tagów */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['{user}', '{server.name}', '{channel}', '{memberCount}'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            const cur = selectedStep.messageText || '';
                            const updated = cur ? `${cur} ${tag}` : tag;
                            onUpdateFlow((prev) => ({
                              ...prev,
                              steps: prev.steps.map((s) =>
                                s.id === selectedStep.id ? { ...s, messageText: updated } : s
                              )
                            }));
                          }}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-indigo-300 border border-indigo-500/20"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Bogaty edytor karty Embed */}
                {selectedStep.type === 'send_embed' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Tytuł Embedu
                      </label>
                      <input
                        type="text"
                        value={selectedStep.embedTitle || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === selectedStep.id ? { ...s, embedTitle: e.target.value } : s
                            )
                          }))
                        }
                        className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Opis Embedu (Markdown)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedStep.embedDescription || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === selectedStep.id ? { ...s, embedDescription: e.target.value } : s
                            )
                          }))
                        }
                        className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>

                    {/* Paleta kolorów Embed */}
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Kolor paska bocznego
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {DISCORD_COLOR_PRESETS.map((p) => (
                          <button
                            key={p.hex}
                            onClick={() =>
                              onUpdateFlow((prev) => ({
                                ...prev,
                                steps: prev.steps.map((s) =>
                                  s.id === selectedStep.id ? { ...s, embedColor: p.hex } : s
                                )
                              }))
                            }
                            style={{ backgroundColor: p.hex }}
                            title={p.name}
                            className={`w-6 h-6 rounded-lg border-2 transition-transform ${
                              selectedStep.embedColor === p.hex
                                ? 'border-white scale-110 shadow-lg'
                                : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        value={selectedStep.embedColor || '#5865F2'}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === selectedStep.id ? { ...s, embedColor: e.target.value } : s
                            )
                          }))
                        }
                        className="w-full px-3 py-1.5 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white font-mono text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Tekst stopki (Footer)
                      </label>
                      <input
                        type="text"
                        value={selectedStep.embedFooter || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === selectedStep.id ? { ...s, embedFooter: e.target.value } : s
                            )
                          }))
                        }
                        placeholder="np. KitekBot • Powered by BotGhost"
                        className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white focus:outline-none"
                      />
                    </div>

                    {/* Podgląd karty Embed */}
                    <div className="pt-2">
                      <BotGhostEmbedPreview
                        title={selectedStep.embedTitle}
                        description={selectedStep.embedDescription}
                        color={selectedStep.embedColor}
                        footer={selectedStep.embedFooter}
                        serverName={serverName}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Kastomizacja Warunku IF */}
                {selectedStep.type === 'condition_if' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Typ sprawdzanego warunku
                      </label>
                      <select
                        value={selectedStep.conditionType || 'has_role'}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === selectedStep.id
                                ? { ...s, conditionType: e.target.value as any }
                                : s
                            )
                          }))
                        }
                        className="w-full px-3 py-2 bg-[#101116] border border-purple-500/40 rounded-xl text-white cursor-pointer"
                      >
                        <option value="has_role">Użytkownik posiada rolę</option>
                        <option value="has_permission">Posiada uprawnienie Administratora</option>
                        <option value="random_chance">Losowa szansa procentowa (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Wartość warunku (rola lub %)
                      </label>
                      <input
                        type="text"
                        value={selectedStep.conditionValue || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === selectedStep.id ? { ...s, conditionValue: e.target.value } : s
                            )
                          }))
                        }
                        placeholder="np. VIP, Moderator, 50"
                        className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#101116] border border-[#2c2d3a] space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Prawy port [THEN]: gdy warunek spełniony
                      </div>
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        Prawy port [ELSE]: gdy warunek niespełniony
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Kastomizacja Roli */}
                {(selectedStep.type === 'give_role' || selectedStep.type === 'remove_role') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Nazwa roli
                      </label>
                      <input
                        type="text"
                        value={selectedStep.roleName || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === selectedStep.id ? { ...s, roleName: e.target.value } : s
                            )
                          }))
                        }
                        placeholder="np. Zweryfikowany"
                        className="w-full px-3 py-2 bg-[#101116] border border-[#2c2d3a] rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Czas oczekiwania (Wait) */}
                {selectedStep.type === 'wait' && (
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Czas oczekiwania (sekundy)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={selectedStep.durationSeconds || 2}
                      onChange={(e) =>
                        onUpdateFlow((prev) => ({
                          ...prev,
                          steps: prev.steps.map((s) =>
                            s.id === selectedStep.id
                              ? { ...s, durationSeconds: Number(e.target.value) }
                              : s
                          )
                        }))
                      }
                      className="w-full px-3 py-2 bg-[#101116] border border-amber-500/40 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stopka Drawer */}
          <div className="p-4 border-t border-[#2c2d3a] flex items-center justify-between">
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer w-full text-center"
            >
              Zatwierdź i Zamknij
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
