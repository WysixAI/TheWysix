import React, { useState } from 'react';
import {
  Search,
  Box,
  Code2,
  AlertTriangle,
  ClipboardList,
  Clock,
  Archive,
  Menu,
  HelpCircle,
  GripVertical,
  Undo2,
  Edit3,
  FileSpreadsheet,
  Trash2,
  Share2,
  ThumbsUp,
  Pin,
  Shield,
  ShieldAlert,
  UserX,
  Ban,
  Split,
  Timer,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { ActionStepType } from '../../types/guildConfig';

interface BotGhostToolboxProps {
  onAddStep: (type: ActionStepType) => void;
  onChangeTrigger: () => void;
  onOpenVariables: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onAddErrorHandler?: () => void;
}

export interface BotGhostBlockItem {
  type: ActionStepType;
  title: string;
  desc: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  tab: 'options' | 'actions' | 'conditions';
  category: 'advanced_message' | 'message_actions' | 'roles_members' | 'logic_flow';
  // Kompatybilność wsteczna z widokiem kaskadowym i starszym kodem
  badge?: string;
  bgColor?: string;
  borderColor?: string;
  color?: string;
  categoryLabel?: string;
}

export type ToolboxBlockItem = BotGhostBlockItem;

export const BOTGHOST_BLOCKS: BotGhostBlockItem[] = [
  // --- ADVANCED MESSAGE ---
  {
    type: 'send_message',
    title: 'Send or Edit a Message',
    desc: 'Send or edit a message with optional buttons and select menus.',
    icon: Undo2,
    iconBg: 'bg-[#5865F2]',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'advanced_message'
  },
  {
    type: 'send_embed',
    title: 'Edit a Button or Select Menu',
    desc: 'Edit a button or select menu in a message',
    icon: Edit3,
    iconBg: 'bg-[#5865F2]',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'advanced_message'
  },

  // --- MESSAGE ACTIONS ---
  {
    type: 'send_ephemeral',
    title: 'Send a Form',
    desc: 'Send a form or modal and wait for a response',
    icon: FileSpreadsheet,
    iconBg: 'bg-[#5865F2]',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'message_actions'
  },
  {
    type: 'delete_message',
    title: 'Delete a Message',
    desc: 'Delete a message or reply',
    icon: Trash2,
    iconBg: 'bg-[#5865F2]',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'message_actions'
  },
  {
    type: 'send_dm',
    title: 'Publish a Message',
    desc: 'Publish a message sent in an announcement channel',
    icon: Share2,
    iconBg: 'bg-[#5865F2]',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'message_actions'
  },
  {
    type: 'add_reaction',
    title: 'React to a Message',
    desc: 'React to a message',
    icon: ThumbsUp,
    iconBg: 'bg-[#5865F2]',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'message_actions'
  },
  {
    type: 'purge_messages',
    title: 'Pin a Message',
    desc: 'Pin a message or reply sent in this command',
    icon: Pin,
    iconBg: 'bg-[#5865F2]',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'message_actions'
  },

  // --- ROLE & MEMBER ACTIONS ---
  {
    type: 'give_role',
    title: 'Give a Role',
    desc: 'Add a role to the user or command target',
    icon: Shield,
    iconBg: 'bg-indigo-600',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'roles_members'
  },
  {
    type: 'remove_role',
    title: 'Remove a Role',
    desc: 'Remove a role from the member',
    icon: ShieldAlert,
    iconBg: 'bg-indigo-600',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'roles_members'
  },
  {
    type: 'timeout_member',
    title: 'Timeout Member',
    desc: 'Mute or timeout a member for a specified duration',
    icon: Clock,
    iconBg: 'bg-indigo-600',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'roles_members'
  },
  {
    type: 'kick_member',
    title: 'Kick Member',
    desc: 'Kick a member from the Discord server',
    icon: UserX,
    iconBg: 'bg-rose-600',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'roles_members'
  },
  {
    type: 'ban_member',
    title: 'Ban Member',
    desc: 'Ban a member permanently from the server',
    icon: Ban,
    iconBg: 'bg-rose-700',
    iconColor: 'text-white',
    tab: 'actions',
    category: 'roles_members'
  },

  // --- LOGIC & FLOW (CONDITIONS) ---
  {
    type: 'condition_if',
    title: 'Condition IF (Branching)',
    desc: 'Branch flow logic: THEN (green) and ELSE (red) output ports',
    icon: Split,
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    tab: 'conditions',
    category: 'logic_flow'
  },
  {
    type: 'wait',
    title: 'Wait Delay',
    desc: 'Pause flow execution for specified seconds',
    icon: Timer,
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    tab: 'conditions',
    category: 'logic_flow'
  },
  {
    type: 'cooldown',
    title: 'Cooldown Limiter',
    desc: 'Limit how often users can execute this command',
    icon: Clock,
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    tab: 'options',
    category: 'logic_flow'
  },
  {
    type: 'stop_flow',
    title: 'Stop Command Flow',
    desc: 'Immediately stop command execution pipeline',
    icon: AlertCircle,
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    tab: 'conditions',
    category: 'logic_flow'
  }
];

export const TOOLBOX_BLOCKS = BOTGHOST_BLOCKS;

export function BotGhostToolbox({
  onAddStep,
  onChangeTrigger,
  onOpenVariables,
  isOpen,
  onToggle,
  onAddErrorHandler
}: BotGhostToolboxProps) {
  const [activeDockIcon, setActiveDockIcon] = useState<'blocks' | 'code' | 'errors' | 'events' | 'timed' | 'storage'>('blocks');
  const [activeTab, setActiveTab] = useState<'options' | 'actions' | 'conditions'>('actions');
  const [searchQuery, setSearchQuery] = useState('');

  // Obsługa przeciągania klocków na płótno (HTML5 Drag & Drop)
  const handleDragStart = (e: React.DragEvent, type: ActionStepType) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.setData('application/json', JSON.stringify({ type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredBlocks = BOTGHOST_BLOCKS.filter((block) => {
    const matchesTab = activeTab === 'actions' ? true : block.tab === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const advancedMessageBlocks = filteredBlocks.filter((b) => b.category === 'advanced_message');
  const messageActionBlocks = filteredBlocks.filter((b) => b.category === 'message_actions');
  const roleBlocks = filteredBlocks.filter((b) => b.category === 'roles_members');
  const logicBlocks = filteredBlocks.filter((b) => b.category === 'logic_flow');

  return (
    <div className="flex shrink-0 z-30 select-none h-full">
      {/* =================================================================== */}
      {/* 1. SKRAJNA PIONOWA DOKOWNIA IKON (LEFTMOST ICON DOCK ~50px)        */}
      {/* =================================================================== */}
      <div className="w-12 sm:w-14 bg-[#14151a] border-r border-[#262730] flex flex-col items-center py-3 gap-2.5 shrink-0">
        {/* 1. Blocks (Active - Blue) */}
        <button
          onClick={() => {
            setActiveDockIcon('blocks');
            if (!isOpen) onToggle();
          }}
          title="Blocks"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeDockIcon === 'blocks' && isOpen
              ? 'bg-[#5865F2] text-white shadow-lg shadow-indigo-950/50'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box className="w-5 h-5" />
        </button>

        {/* 2. Code (Magenta) */}
        <button
          onClick={() => {
            setActiveDockIcon('code');
            onOpenVariables();
          }}
          title="Variables & Code {x}"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeDockIcon === 'code'
              ? 'bg-fuchsia-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-fuchsia-400 hover:bg-white/5'
          }`}
        >
          <Code2 className="w-5 h-5 text-fuchsia-400" />
        </button>

        {/* 3. Errors (Red) */}
        <button
          onClick={() => {
            setActiveDockIcon('errors');
            if (onAddErrorHandler) onAddErrorHandler();
          }}
          title="Error Handler"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeDockIcon === 'errors'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-red-400 hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </button>

        {/* 4. Events (Green) */}
        <button
          onClick={() => {
            setActiveDockIcon('events');
            onChangeTrigger();
          }}
          title="Events & Trigger"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeDockIcon === 'events'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-emerald-400 hover:bg-white/5'
          }`}
        >
          <ClipboardList className="w-5 h-5 text-emerald-400" />
        </button>

        {/* 5. Timed (Yellow) */}
        <button
          onClick={() => {
            setActiveDockIcon('timed');
            onAddStep('wait');
          }}
          title="Timed Actions & Delay"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeDockIcon === 'timed'
              ? 'bg-amber-500 text-white shadow-lg'
              : 'text-neutral-400 hover:text-amber-400 hover:bg-white/5'
          }`}
        >
          <Clock className="w-5 h-5 text-amber-400" />
        </button>

        {/* 6. Storage (Violet) */}
        <button
          onClick={() => {
            setActiveDockIcon('storage');
            alert('Pamięć zmiennych oraz bazy danych jest aktywna w KitekBot v6.0.0!');
          }}
          title="Data Storage & Variables"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeDockIcon === 'storage'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-purple-400 hover:bg-white/5'
          }`}
        >
          <Archive className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* =================================================================== */}
      {/* 2. SZUFLADA BLOKÓW (BLOCKS DRAWER Z OBRAZKA 2)                      */}
      {/* =================================================================== */}
      {isOpen && (
        <aside className="w-72 sm:w-80 bg-[#191a22] border-r border-[#272832] flex flex-col h-full overflow-hidden">
          {/* Nagłówek: Blocks ❔ + hamburger toggle [☰] */}
          <div className="p-4 pb-2 border-b border-[#252630] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-white tracking-tight">
                  Blocks
                </h3>
                <HelpCircle className="w-4 h-4 text-neutral-400" />
              </div>

              <button
                onClick={onToggle}
                title="Zwiń/rozwiń panel"
                className="w-8 h-8 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Drag and drop <span className="text-amber-400 font-semibold">Options</span>, <span className="text-indigo-400 font-semibold">Actions</span> and <span className="text-emerald-400 font-semibold">Conditions</span> to add them to your command. Connect the corresponding colors to create your command flow.
            </p>

            {/* Pigułkowe zakładki: Options | Actions | Conditions */}
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                onClick={() => setActiveTab('options')}
                className={`py-1.5 text-xs font-black transition-all cursor-pointer text-center relative ${
                  activeTab === 'options'
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Options
                {activeTab === 'options' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('actions')}
                className={`py-1.5 text-xs font-black transition-all cursor-pointer text-center relative ${
                  activeTab === 'actions'
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Actions
                {activeTab === 'actions' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('conditions')}
                className={`py-1.5 text-xs font-black transition-all cursor-pointer text-center relative ${
                  activeTab === 'conditions'
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Conditions
                {activeTab === 'conditions' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Pole wyszukiwania "Search" */}
            <div className="relative pt-1">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#14151a] border border-[#2b2c37] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Przewijana lista pogrupowanych klocków */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Grupa 1: Advanced Message */}
            {advancedMessageBlocks.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-1">
                  Advanced Message
                </div>
                {advancedMessageBlocks.map((b) => (
                  <BlockRowItem key={b.type} block={b} onAdd={() => onAddStep(b.type)} onDragStart={handleDragStart} />
                ))}
              </div>
            )}

            {/* Grupa 2: Message Actions */}
            {messageActionBlocks.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-1">
                  Message Actions
                </div>
                {messageActionBlocks.map((b) => (
                  <BlockRowItem key={b.type} block={b} onAdd={() => onAddStep(b.type)} onDragStart={handleDragStart} />
                ))}
              </div>
            )}

            {/* Grupa 3: Role & Member Actions */}
            {roleBlocks.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-1">
                  Role & Member Actions
                </div>
                {roleBlocks.map((b) => (
                  <BlockRowItem key={b.type} block={b} onAdd={() => onAddStep(b.type)} onDragStart={handleDragStart} />
                ))}
              </div>
            )}

            {/* Grupa 4: Logic & Flow */}
            {logicBlocks.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-1">
                  Logic & Conditions
                </div>
                {logicBlocks.map((b) => (
                  <BlockRowItem key={b.type} block={b} onAdd={() => onAddStep(b.type)} onDragStart={handleDragStart} />
                ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

interface BlockRowItemProps {
  key?: React.Key;
  block: BotGhostBlockItem;
  onAdd: () => void;
  onDragStart: (e: React.DragEvent, type: ActionStepType) => void;
}

const BlockRowItem: React.FC<BlockRowItemProps> = ({
  block,
  onAdd,
  onDragStart
}) => {
  const Icon = block.icon;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, block.type)}
      onClick={onAdd}
      className="group p-2.5 rounded-xl bg-[#202129] hover:bg-[#252632] border border-[#2c2d38] hover:border-[#5865F2]/50 transition-all cursor-grab active:cursor-grabbing flex items-center gap-2.5 shadow-sm"
    >
      {/* Uchwyt przeciągania */}
      <GripVertical className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 shrink-0" />

      {/* Kwadratowa ikonka błękitna jak w BotGhost */}
      <div className={`w-7 h-7 rounded-lg ${block.iconBg} flex items-center justify-center text-white shrink-0 shadow-sm`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Teksty */}
      <div className="min-w-0 flex-1">
        <h5 className="text-xs font-black text-white truncate group-hover:text-[#8590ff] transition-colors">
          {block.title}
        </h5>
        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
          {block.desc}
        </p>
      </div>
    </div>
  );
}
