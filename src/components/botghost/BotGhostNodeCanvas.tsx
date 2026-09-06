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
  Move,
  Maximize2,
  RotateCcw,
  Check,
  Split,
  ZoomIn,
  ZoomOut,
  Sliders,
  Play,
  Layers,
  ArrowDown,
  Hammer,
  AlertTriangle
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

interface DraggingNodeState {
  nodeId: string; // 'trigger' lub id kroku
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

export function BotGhostNodeCanvas({
  flow,
  serverName,
  onUpdateFlow,
  onOpenTriggerModal,
  onOpenVariables,
  availableRoles
}: BotGhostNodeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Stan widoku płótna: przesunięcie (pan) i powiększenie (zoom)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 200, y: 80 });
  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Przeciąganie klocków na płótnie
  const [draggingNode, setDraggingNode] = useState<DraggingNodeState | null>(null);

  // Tworzenie połączenia (kabla/linku) między węzłami
  const [connecting, setConnecting] = useState<ConnectingState | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; portType: 'in' } | null>(null);

  // Węzły z pozycjami domyślnymi
  const triggerPos = flow.triggerPosition || { x: 420, y: 60 };
  const errorHandlerPos = flow.errorHandlerPosition || { x: 50, y: 60 };

  // Domyślne rozmieszczenie kroków, jeśli nie mają x, y
  const getStepPosition = useCallback(
    (step: ActionStep, index: number) => {
      if (typeof step.x === 'number' && typeof step.y === 'number') {
        return { x: step.x, y: step.y };
      }
      // Domyślny układ kaskadowy w dół
      return { x: 380, y: 320 + index * 260 };
    },
    []
  );

  // Inicjalizacja połączeń domyślnych, jeśli flow ich jeszcze nie posiada
  useEffect(() => {
    if (!flow.connections || flow.connections.length === 0) {
      const defaultConnections: ActionConnection[] = [];
      if (flow.steps.length > 0) {
        // Połączenie wyzwalacza z pierwszym krokiem
        defaultConnections.push({
          id: 'conn-trig-' + flow.steps[0].id,
          fromNodeId: 'trigger',
          fromPort: 'default',
          toNodeId: flow.steps[0].id
        });
        // Połączenia kolejnych kroków
        for (let i = 0; i < flow.steps.length - 1; i++) {
          defaultConnections.push({
            id: `conn-${flow.steps[i].id}-${flow.steps[i + 1].id}`,
            fromNodeId: flow.steps[i].id,
            fromPort: 'default',
            toNodeId: flow.steps[i + 1].id
          });
        }
      }
      onUpdateFlow((prev) => ({
        ...prev,
        connections: defaultConnections
      }));
    }
  }, []);

  // --- OBSŁUGA UPUSZCZANIA KLOCKÓW Z PRZYBORNIKA (DROP NA PLANSZĘ) ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const typeStr = e.dataTransfer.getData('text/plain') as ActionStepType;
    if (!typeStr) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Przeliczenie współrzędnych kursora na współrzędne wirtualnego płótna
    const dropX = Math.round((e.clientX - rect.left - pan.x) / zoom);
    const dropY = Math.round((e.clientY - rect.top - pan.y) / zoom);

    addNewStepAtPosition(typeStr, dropX - 160, dropY - 40);
  };

  const addNewStepAtPosition = (type: ActionStepType, posX: number, posY: number) => {
    const newStepId = 'step-' + Math.random().toString(36).substring(2, 9);
    const newStep: ActionStep = {
      id: newStepId,
      type,
      x: posX,
      y: posY,
      durationSeconds: type === 'wait' ? 2 : undefined,
      cooldownSeconds: type === 'cooldown' ? 15 : undefined,
      messageText:
        type === 'send_message' || type === 'send_ephemeral' || type === 'send_dm'
          ? 'Wiadomość z bota: Witaj {user}!'
          : undefined,
      embedTitle: type === 'send_embed' ? '📌 Informacja' : undefined,
      embedDescription: type === 'send_embed' ? 'Treść karty embed dla {user}' : undefined,
      embedColor: type === 'send_embed' ? '#5865F2' : undefined,
      roleName: type === 'give_role' || type === 'remove_role' ? 'Zweryfikowany' : undefined,
      conditionType: type === 'condition_if' ? 'has_role' : undefined,
      conditionValue: type === 'condition_if' ? 'Gracz' : undefined
    };

    onUpdateFlow((prev) => {
      const steps = [...prev.steps, newStep];
      // Jeśli to pierwszy krok, połącz od razu z wyzwalaczem
      const conns = [...(prev.connections || [])];
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
  };

  // --- PRZECIĄGANIE WĘZŁÓW PO PŁÓTNIE ---
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Tylko lewy przycisk myszy

    let initX = 0;
    let initY = 0;

    if (nodeId === 'trigger') {
      initX = triggerPos.x;
      initY = triggerPos.y;
    } else if (nodeId === 'error_handler') {
      initX = errorHandlerPos.x;
      initY = errorHandlerPos.y;
    } else {
      const s = flow.steps.find((st) => st.id === nodeId);
      if (s) {
        const p = getStepPosition(s, flow.steps.indexOf(s));
        initX = p.x;
        initY = p.y;
      }
    }

    setDraggingNode({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: initX,
      initialY: initY
    });
  };

  // --- PRZESUWANIE PŁÓTNA (PANNING) ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
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

    // 2. Przeciąganie węzła
    if (draggingNode) {
      const deltaX = (e.clientX - draggingNode.startX) / zoom;
      const deltaY = (e.clientY - draggingNode.startY) / zoom;
      const newX = Math.round(draggingNode.initialX + deltaX);
      const newY = Math.round(draggingNode.initialY + deltaY);

      if (draggingNode.nodeId === 'trigger') {
        onUpdateFlow((prev) => ({
          ...prev,
          triggerPosition: { x: newX, y: newY }
        }));
      } else if (draggingNode.nodeId === 'error_handler') {
        onUpdateFlow((prev) => ({
          ...prev,
          errorHandlerPosition: { x: newX, y: newY }
        }));
      } else {
        onUpdateFlow((prev) => ({
          ...prev,
          steps: prev.steps.map((st) => (st.id === draggingNode.nodeId ? { ...st, x: newX, y: newY } : st))
        }));
      }
      return;
    }

    // 3. Ciągnięcie linku/kabla łączącego
    if (connecting && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currX = (e.clientX - rect.left - pan.x) / zoom;
      const currY = (e.clientY - rect.top - pan.y) / zoom;
      setConnecting((prev) => (prev ? { ...prev, currentX: currX, currentY: currY } : null));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);

    // Jeśli upuszczono link nad portem wejściowym docelowego węzła
    if (connecting && hoveredPort) {
      createConnection(connecting.fromNodeId, connecting.fromPort, hoveredPort.nodeId);
    }
    setConnecting(null);
    setHoveredPort(null);
  };

  // --- ZARZĄDZANIE POŁĄCZENIAMI (KABLAMI) ---
  const startConnecting = (
    e: React.MouseEvent,
    fromNodeId: string,
    fromPort: 'default' | 'then' | 'else',
    portX: number,
    portY: number
  ) => {
    e.stopPropagation();
    setConnecting({
      fromNodeId,
      fromPort,
      startX: portX,
      startY: portY,
      currentX: portX,
      currentY: portY
    });
  };

  const createConnection = (fromNodeId: string, fromPort: 'default' | 'then' | 'else', toNodeId: string) => {
    if (fromNodeId === toNodeId) return; // Nie można łączyć ze samym sobą

    onUpdateFlow((prev) => {
      const currentConns = prev.connections || [];
      // Usuń ewentualne istniejące połączenie z tego samego portu
      const filtered = currentConns.filter(
        (c) => !(c.fromNodeId === fromNodeId && c.fromPort === fromPort && c.toNodeId === toNodeId)
      );

      const newConn: ActionConnection = {
        id: `conn-${fromNodeId}-${fromPort}-${toNodeId}`,
        fromNodeId,
        fromPort,
        toNodeId
      };

      return {
        ...prev,
        connections: [...filtered, newConn]
      };
    });
  };

  const deleteConnection = (connId: string) => {
    onUpdateFlow((prev) => ({
      ...prev,
      connections: (prev.connections || []).filter((c) => c.id !== connId)
    }));
  };

  // --- OBLICZANIE WSPÓŁRZĘDNYCH PORTÓW DLA SVG BEZIER CABLES ---
  const getNodeCoordinates = (nodeId: string) => {
    const NODE_WIDTH = 340;
    if (nodeId === 'trigger') {
      return {
        x: triggerPos.x,
        y: triggerPos.y,
        width: NODE_WIDTH,
        height: 180,
        outputPortX: triggerPos.x + NODE_WIDTH / 2,
        outputPortY: triggerPos.y + 180
      };
    }

    if (nodeId === 'error_handler') {
      return {
        x: errorHandlerPos.x,
        y: errorHandlerPos.y,
        width: NODE_WIDTH,
        height: 130,
        outputPortX: errorHandlerPos.x + NODE_WIDTH / 2,
        outputPortY: errorHandlerPos.y + 130
      };
    }

    const stepIndex = flow.steps.findIndex((s) => s.id === nodeId);
    if (stepIndex === -1) return null;
    const step = flow.steps[stepIndex];
    const pos = getStepPosition(step, stepIndex);
    const height = step.collapsed ? 54 : 220;

    return {
      x: pos.x,
      y: pos.y,
      width: NODE_WIDTH,
      height,
      inputPortX: pos.x + NODE_WIDTH / 2,
      inputPortY: pos.y,
      outputPortX: pos.x + NODE_WIDTH / 2,
      outputPortY: pos.y + height,
      // Dla warunków IF: port THEN i port ELSE
      thenPortX: pos.x + NODE_WIDTH * 0.25,
      thenPortY: pos.y + height,
      elsePortX: pos.x + NODE_WIDTH * 0.75,
      elsePortY: pos.y + height
    };
  };

  // Automatyczne porządkowanie (Auto-Layout) w dół
  const handleAutoLayout = () => {
    onUpdateFlow((prev) => {
      const updatedSteps = prev.steps.map((st, i) => ({
        ...st,
        x: 380,
        y: 320 + i * 260
      }));
      return {
        ...prev,
        triggerPosition: { x: 380, y: 50 },
        steps: updatedSteps
      };
    });
    setPan({ x: 200, y: 80 });
    setZoom(1);
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative flex-1 w-full h-full overflow-hidden bg-[#121318] cursor-crosshair select-none"
      style={{
        backgroundImage: `radial-gradient(circle, #2d2f3d 1.5px, transparent 1.5px)`,
        backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* 1. PŁYWAJĄCY PASEK NARZĘDZI WIDOKU (BOTTOM-LEFT JAK NA OBRAZKU 2) */}
      <div className="absolute bottom-5 left-5 z-40 flex items-center gap-2 select-none">
        {/* Przycisk Fit View / Wycentruj [⛶] */}
        <button
          onClick={() => {
            setPan({ x: 200, y: 80 });
            setZoom(1);
          }}
          title="Dopasuj widok do ekranu (Fit to screen)"
          className="w-10 h-10 rounded-xl bg-[#1e1f28] hover:bg-[#282936] text-neutral-300 hover:text-white border border-[#2f313f] flex items-center justify-center shadow-2xl cursor-pointer transition-all active:scale-95"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Kontrolki Zoom: Minus, Procent, Plus */}
        <div className="flex items-center bg-[#1e1f28] border border-[#2f313f] rounded-xl overflow-hidden shadow-2xl">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            title="Oddal (Zoom Out)"
            className="w-9 h-10 flex items-center justify-center hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-neutral-300 px-2 min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(2))))}
            title="Przybliż (Zoom In)"
            className="w-9 h-10 flex items-center justify-center hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Auto Layout */}
        <button
          onClick={handleAutoLayout}
          title="Automatycznie uporządkuj klocki w pionowe drzewo"
          className="h-10 px-3.5 rounded-xl bg-[#1e1f28] hover:bg-[#282936] text-neutral-300 hover:text-white border border-[#2f313f] text-xs font-bold transition-all flex items-center gap-2 shadow-2xl cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8590ff]" />
          <span>Auto Layout</span>
        </button>
      </div>

      {/* 3. WARSTWA TRANSFORMOWANA WSPÓŁRZĘDNYMI PAN & ZOOM */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '10000px',
          height: '10000px'
        }}
      >
        {/* WARSTWA SVG: KABLE ŁĄCZĄCE (BEZIER CONNECTIONS) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradient dla standardowego kabla */}
            <linearGradient id="cableGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5865F2" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            {/* Gradient dla gałęzi THEN */}
            <linearGradient id="thenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            {/* Gradient dla gałęzi ELSE */}
            <linearGradient id="elseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>

            {/* Filtr świecenia dla kabli */}
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
            let strokeWidth = 3.5;

            if (conn.fromPort === 'then') {
              startX = fromCoords.thenPortX || startX;
              startY = fromCoords.thenPortY || startY;
              strokeColor = 'url(#thenGradient)';
            } else if (conn.fromPort === 'else') {
              startX = fromCoords.elsePortX || startX;
              startY = fromCoords.elsePortY || startY;
              strokeColor = 'url(#elseGradient)';
            }

            const endX = toCoords.inputPortX || toCoords.x + 170;
            const endY = toCoords.inputPortY || toCoords.y;

            // Krzywa Beziera (S-Curve)
            const deltaY = Math.max(Math.abs(endY - startY) * 0.5, 40);
            const pathD = `M ${startX} ${startY} C ${startX} ${startY + deltaY}, ${endX} ${endY - deltaY}, ${endX} ${endY}`;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            return (
              <g key={conn.id} className="group pointer-events-auto">
                {/* Szerszy niewidoczny obszar do najechania myszą */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="22"
                  className="cursor-pointer"
                  onClick={() => deleteConnection(conn.id)}
                />

                {/* Świecący kabel z animacją przepływu energii */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  filter="url(#glow)"
                  className="transition-all group-hover:stroke-rose-400 group-hover:stroke-[4.5px]"
                />

                {/* Przycisk usuwania połączenia (✕) w punkcie środkowym */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  onClick={() => deleteConnection(conn.id)}
                  className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <circle r="11" fill="#1e1f26" stroke="#f43f5e" strokeWidth="2" />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fill="#f43f5e"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    ✕
                  </text>
                </g>
              </g>
            );
          })}

          {/* RYSOWANIE KABLA W TRAKCIE PRZECIĄGANIA */}
          {connecting && (
            <path
              d={`M ${connecting.startX} ${connecting.startY} C ${connecting.startX} ${
                connecting.startY + 60
              }, ${connecting.currentX} ${connecting.currentY - 60}, ${connecting.currentX} ${
                connecting.currentY
              }`}
              fill="none"
              stroke={
                connecting.fromPort === 'then'
                  ? '#10b981'
                  : connecting.fromPort === 'else'
                  ? '#f43f5e'
                  : '#5865F2'
              }
              strokeWidth="4"
              strokeDasharray="6 4"
              className="animate-pulse"
              filter="url(#glow)"
            />
          )}
        </svg>

        {/* =============================================================== */}
        {/* 1. WĘZEŁ WYZWALACZA (COMMAND TRIGGER NODE Z OBRAZKA 2)          */}
        {/* =============================================================== */}
        <div
          style={{
            transform: `translate(${triggerPos.x}px, ${triggerPos.y}px)`,
            width: '340px'
          }}
          className="absolute z-20 rounded-2xl bg-[#1d1e26] border border-[#2d2f3b] shadow-2xl overflow-visible select-none transition-shadow hover:border-amber-500/50"
        >
          {/* Górny port (Circle port dekoracyjny) */}
          <div className="relative w-full flex justify-center">
            <div className="absolute -top-2.5 w-5 h-5 rounded-full border-2 border-[#121318] bg-[#252632] flex items-center justify-center shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            </div>
          </div>

          {/* Uchwyt przeciągania nagłówka z żółtym młotkiem BotGhost */}
          <div
            onMouseDown={(e) => handleNodeMouseDown(e, 'trigger')}
            className="p-4 cursor-grab active:cursor-grabbing flex items-start gap-3 border-b border-[#262733]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-[#14151a] shrink-0 shadow-md shadow-amber-950/40">
              <Hammer className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-white tracking-tight">
                  /{flow.trigger.commandName || 'komenda'}
                </span>
                <button
                  onClick={onOpenTriggerModal}
                  className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Edytuj
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Drag and drop different options, actions and conditions to add them to your command. Connect the corresponding colors to create your command flow.
              </p>
            </div>
          </div>

          {/* Ciało klocka wyzwalacza */}
          <div className="p-3.5 space-y-2 bg-[#16171f] text-xs rounded-b-2xl">
            {flow.trigger.type === 'command' && (
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Komenda Slash
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 font-mono font-bold">
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
                    className="w-full pl-6 pr-2 py-1.5 bg-[#101116] border border-[#2b2c37] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PORT WYJŚCIOWY (OUTPUT SOCKET) U DOŁU WĘZŁA */}
          <div className="relative w-full flex justify-center">
            <button
              onMouseDown={(e) => startConnecting(e, 'trigger', 'default', triggerPos.x + 170, triggerPos.y + 180)}
              title="Przeciągnij kabel do kolejnego klocka"
              className="absolute -bottom-3.5 w-6 h-6 rounded-full bg-[#5865F2] hover:bg-[#8590ff] border-2 border-[#121318] shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-125 z-30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </button>
          </div>
        </div>

        {/* =============================================================== */}
        {/* 1.5. WĘZEŁ ERROR HANDLER (Z OBRAZKA 2)                           */}
        {/* =============================================================== */}
        <div
          style={{
            transform: `translate(${errorHandlerPos.x}px, ${errorHandlerPos.y}px)`,
            width: '340px'
          }}
          className="absolute z-20 rounded-2xl bg-[#1d1e26] border border-[#2d2f3b] shadow-2xl overflow-visible select-none transition-shadow hover:border-red-500/50"
        >
          {/* Górny port dekoracyjny */}
          <div className="relative w-full flex justify-center">
            <div className="absolute -top-2.5 w-5 h-5 rounded-full border-2 border-[#121318] bg-[#252632] flex items-center justify-center shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            </div>
          </div>

          {/* Uchwyt przeciągania nagłówka z czerwonym trójkątem */}
          <div
            onMouseDown={(e) => handleNodeMouseDown(e, 'error_handler')}
            className="p-4 cursor-grab active:cursor-grabbing flex items-start gap-3 rounded-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-950/40">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-base font-black text-white tracking-tight">
                Error Handler
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Handle errors that occur during the command execution
              </p>
            </div>
          </div>

          {/* PORT WYJŚCIOWY U DOŁU ERROR HANDLERA */}
          <div className="relative w-full flex justify-center">
            <button
              onMouseDown={(e) =>
                startConnecting(e, 'error_handler', 'default', errorHandlerPos.x + 170, errorHandlerPos.y + 130)
              }
              title="Przeciągnij kabel obsługi błędu (np. do Embed Reply)"
              className="absolute -bottom-3.5 w-6 h-6 rounded-full bg-[#5865F2] hover:bg-[#8590ff] border-2 border-[#121318] shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-125 z-30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </button>
          </div>
        </div>

        {/* =============================================================== */}
        {/* 2. WĘZŁY AKCJI (ACTION STEP NODES NA PLANSZY)                   */}
        {/* =============================================================== */}
        {flow.steps.map((step, index) => {
          const blockDef = TOOLBOX_BLOCKS.find((b) => b.type === step.type) || TOOLBOX_BLOCKS[0];
          const StepIcon = blockDef.icon;
          const pos = getStepPosition(step, index);

          return (
            <div
              key={step.id}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: '340px'
              }}
              className="absolute z-20 rounded-2xl bg-[#1d1e26] border border-[#2d2f3b] shadow-2xl overflow-visible select-none transition-shadow hover:border-[#5865F2]/50"
            >
              {/* PORT WEJŚCIOWY (INPUT SOCKET) U GÓRY WĘZŁA */}
              <div className="relative w-full flex justify-center">
                <div
                  onMouseEnter={() => setHoveredPort({ nodeId: step.id, portType: 'in' })}
                  onMouseLeave={() => setHoveredPort(null)}
                  title="Port wejściowy (upuszczaj tutaj kabel)"
                  className={`absolute -top-3 w-6 h-6 rounded-full border-2 border-[#121318] shadow-md flex items-center justify-center transition-all z-30 cursor-pointer ${
                    hoveredPort?.nodeId === step.id
                      ? 'bg-emerald-400 scale-125 ring-4 ring-emerald-500/40 animate-pulse'
                      : 'bg-[#5865F2] hover:bg-[#8590ff]'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* BELKA NAGŁÓWKA KLOCKA (UCHWYT DO PRZECIĄGANIA) */}
              <div
                onMouseDown={(e) => handleNodeMouseDown(e, step.id)}
                className="p-4 flex items-start justify-between rounded-t-2xl cursor-grab active:cursor-grabbing border-b border-[#262733] gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-950/40">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-white truncate">
                      {step.type === 'send_embed' ? 'Embed Reply' : blockDef.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                      {step.type === 'send_embed' ? 'Bot replies with an embed response' : blockDef.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      onUpdateFlow((prev) => ({
                        ...prev,
                        steps: prev.steps.map((s) => (s.id === step.id ? { ...s, collapsed: !s.collapsed } : s))
                      }))
                    }
                    title={step.collapsed ? 'Rozwiń klocek' : 'Zwiń klocek'}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
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
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ZAWARTOŚĆ KLOCKA AKCJI (ROZWINIĘTE POLA EDYCJI) */}
              {!step.collapsed && (
                <div className="p-3.5 space-y-2.5 bg-[#16171f] text-xs">
                  {/* Wiadomość / Ephemeral / DM */}
                  {(step.type === 'send_message' || step.type === 'send_ephemeral' || step.type === 'send_dm') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-emerald-300 uppercase">
                          Treść wiadomości
                        </label>
                        <button
                          onClick={onOpenVariables}
                          className="text-[10px] text-[#8590ff] hover:underline font-bold"
                        >
                          + Zmienne
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={step.messageText || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) => (s.id === step.id ? { ...s, messageText: e.target.value } : s))
                          }))
                        }
                        placeholder="Treść wiadomości..."
                        className="w-full px-2.5 py-1.5 bg-[#121318] border border-[#31323f] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Karta Embed */}
                  {step.type === 'send_embed' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tytuł embedu..."
                        value={step.embedTitle || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) => (s.id === step.id ? { ...s, embedTitle: e.target.value } : s))
                          }))
                        }
                        className="w-full px-2 py-1 bg-[#121318] border border-[#31323f] rounded-lg text-xs text-white focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        placeholder="Opis embedu..."
                        value={step.embedDescription || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === step.id ? { ...s, embedDescription: e.target.value } : s
                            )
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-[#121318] border border-[#31323f] rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Czekaj / Wait */}
                  {step.type === 'wait' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                        <span>Czas opóźnienia:</span>
                        <span className="font-mono text-white">{step.durationSeconds || 2}s</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={step.durationSeconds || 2}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === step.id ? { ...s, durationSeconds: parseInt(e.target.value) || 2 } : s
                            )
                          }))
                        }
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Rola (Nadaj / Odbierz) */}
                  {(step.type === 'give_role' || step.type === 'remove_role') && (
                    <div>
                      <label className="block text-[10px] font-bold text-sky-300 uppercase mb-1">
                        Nazwa roli
                      </label>
                      <input
                        type="text"
                        placeholder="np. Zweryfikowany"
                        value={step.roleName || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) => (s.id === step.id ? { ...s, roleName: e.target.value } : s))
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#121318] border border-sky-500/40 rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Warunek IF */}
                  {step.type === 'condition_if' && (
                    <div className="space-y-2">
                      <select
                        value={step.conditionType || 'has_role'}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) =>
                              s.id === step.id ? { ...s, conditionType: e.target.value as any } : s
                            )
                          }))
                        }
                        className="w-full px-2 py-1 bg-[#121318] border border-purple-500/40 rounded-lg text-xs text-white cursor-pointer"
                      >
                        <option value="has_role">Posiada rolę</option>
                        <option value="has_permission">Administrator</option>
                        <option value="random_chance">Losowa szansa %</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Wartość (np. Gracz, 50)"
                        value={step.conditionValue || ''}
                        onChange={(e) =>
                          onUpdateFlow((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s) => (s.id === step.id ? { ...s, conditionValue: e.target.value } : s))
                          }))
                        }
                        className="w-full px-2 py-1 bg-[#121318] border border-purple-500/40 rounded-lg text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* PORTY WYJŚCIOWE U DOŁU KLOCKA */}
              {step.type === 'condition_if' ? (
                /* Dla IF: Dwa porty wyjściowe (THEN i ELSE) */
                <div className="relative w-full flex items-center justify-around pb-1">
                  {/* Port THEN (Zielony) */}
                  <div className="relative flex flex-col items-center">
                    <button
                      onMouseDown={(e) =>
                        startConnecting(e, step.id, 'then', pos.x + 85, pos.y + (step.collapsed ? 54 : 220))
                      }
                      title="Przeciągnij kabel THEN (Gdy warunek spełniony)"
                      className="absolute -bottom-3.5 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-[#121318] shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
                    >
                      <Check className="w-3.5 h-3.5 text-[#121318] stroke-[3]" />
                    </button>
                    <span className="text-[9px] font-black uppercase text-emerald-400 mt-2 block">THEN</span>
                  </div>

                  {/* Port ELSE (Czerwony) */}
                  <div className="relative flex flex-col items-center">
                    <button
                      onMouseDown={(e) =>
                        startConnecting(e, step.id, 'else', pos.x + 255, pos.y + (step.collapsed ? 54 : 220))
                      }
                      title="Przeciągnij kabel ELSE (W przeciwnym razie)"
                      className="absolute -bottom-3.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-[#121318] shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
                    >
                      <X className="w-3.5 h-3.5 text-[#121318] stroke-[3]" />
                    </button>
                    <span className="text-[9px] font-black uppercase text-rose-400 mt-2 block">ELSE</span>
                  </div>
                </div>
              ) : (
                /* Dla zwykłych akcji: Jeden port wyjściowy u dołu */
                <div className="relative w-full flex justify-center">
                  <button
                    onMouseDown={(e) =>
                      startConnecting(e, step.id, 'default', pos.x + 170, pos.y + (step.collapsed ? 54 : 220))
                    }
                    title="Przeciągnij kabel do kolejnego klocka"
                    className="absolute -bottom-3.5 w-6 h-6 rounded-full bg-[#5865F2] hover:bg-[#8590ff] border-2 border-[#121318] shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
