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
  ArrowDown
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
  const triggerPos = flow.triggerPosition || { x: 380, y: 50 };

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
        height: 200,
        outputPortX: triggerPos.x + NODE_WIDTH / 2,
        outputPortY: triggerPos.y + 200
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
      {/* 1. KONTROLKI PŁÓTNA (ZOOM, AUTO-LAYOUT, POMOC) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-[#181920]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#2d2e38] shadow-2xl">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
          title="Przybliż (Zoom In)"
          className="p-2 rounded-xl bg-[#23242e] hover:bg-[#2e2f3d] text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-bold text-neutral-400 px-1 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          title="Oddal (Zoom Out)"
          className="p-2 rounded-xl bg-[#23242e] hover:bg-[#2e2f3d] text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-[#31323f]" />
        <button
          onClick={handleAutoLayout}
          title="Uporządkuj klocki w pionowe drzewo"
          className="px-3 py-1.5 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#8590ff] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#5865F2]/40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Uporządkuj</span>
        </button>
      </div>

      {/* 2. ETYKIETA PODPOWIEDZI NA PŁÓTNIE */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-none bg-[#181920]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#2d2e38] text-[11px] text-neutral-400 shadow-xl space-y-0.5">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-[#5865F2]" />
          <span>Swobodne Płótno BotGhost (Drag & Connect)</span>
        </div>
        <div>• Przeciągaj klocki z lewego paska i upuszczaj w dowolnym miejscu.</div>
        <div>• Klikaj okrągłe piny (●) u dołu klocków, aby łączyć je kablami z kolejnymi akcjami.</div>
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
        {/* 1. WĘZEŁ WYZWALACZA (TRIGGER NODE NA PLANSZY)                    */}
        {/* =============================================================== */}
        <div
          style={{
            transform: `translate(${triggerPos.x}px, ${triggerPos.y}px)`,
            width: '340px'
          }}
          className="absolute z-20 rounded-2xl bg-[#1e1f26] border-2 border-amber-500/70 shadow-2xl overflow-visible select-none"
        >
          {/* Uchwyt przeciągania nagłówka */}
          <div
            onMouseDown={(e) => handleNodeMouseDown(e, 'trigger')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white flex items-center justify-between rounded-t-2xl cursor-grab active:cursor-grabbing shadow-md"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white text-white" />
              <span className="text-xs font-black tracking-wide uppercase">Wyzwalacz (Trigger)</span>
            </div>

            <button
              onClick={onOpenTriggerModal}
              className="px-2 py-0.5 rounded bg-black/30 hover:bg-black/50 text-[10px] font-bold text-white transition-all cursor-pointer"
            >
              Zmień
            </button>
          </div>

          {/* Ciało klocka wyzwalacza */}
          <div className="p-3.5 space-y-2.5 bg-[#181920] text-xs">
            {flow.trigger.type === 'command' && (
              <div>
                <label className="block text-[10px] font-bold text-amber-300 uppercase mb-1">
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
                    className="w-full pl-6 pr-2 py-1.5 bg-[#121318] border border-[#31323f] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                Opis w menu
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
                placeholder="Opis komendy bota..."
                className="w-full px-2 py-1.5 bg-[#121318] border border-[#31323f] rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* PORT WYJŚCIOWY (OUTPUT SOCKET) U DOŁU WĘZŁA */}
          <div className="relative w-full flex justify-center">
            <button
              onMouseDown={(e) => startConnecting(e, 'trigger', 'default', triggerPos.x + 170, triggerPos.y + 200)}
              title="Przeciągnij kabel do kolejnego klocka"
              className="absolute -bottom-3.5 w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-400 border-2 border-[#121318] shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-125 z-30 group"
            >
              <ArrowDown className="w-3.5 h-3.5 text-[#121318] stroke-[3]" />
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
              className={`absolute z-20 rounded-2xl bg-[#1e1f26] border-2 shadow-2xl overflow-visible select-none transition-shadow ${blockDef.borderColor}`}
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
                className={`px-3.5 py-2.5 flex items-center justify-between rounded-t-2xl cursor-grab active:cursor-grabbing border-b ${blockDef.bgColor} ${blockDef.borderColor}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg bg-black/40 ${blockDef.color} shrink-0`}>
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{blockDef.title}</div>
                    <div className="text-[9px] font-bold text-neutral-400 uppercase truncate">
                      #{index + 1} {blockDef.badge}
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
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-black/20"
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
                    className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-black/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ZAWARTOŚĆ KLOCKA AKCJI (ROZWINIĘTE POLA EDYCJI) */}
              {!step.collapsed && (
                <div className="p-3.5 space-y-2.5 bg-[#181920] text-xs">
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
