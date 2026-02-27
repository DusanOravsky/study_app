import React from 'react';
import { 
  Brain, TrendingUp, Target, Award, BookOpen, AlertCircle, CheckCircle, XCircle, 
  ArrowRight, Lightbulb, Users, Eye, Pencil, Sparkles, MessageCircle, FileText, 
  Calendar, Trophy, GraduationCap, Volume2, Image as ImageIcon, LogIn, Search, 
  Clock, Medal, Star, Zap, CreditCard, Check, X as XIcon, BarChart, Home, Mail, 
  Phone, Download, Share2, Lock, Unlock, TrendingDown, Activity, Briefcase,
  Settings, Bell, Heart, Flag, ChevronRight, ChevronDown, Filter, SortAsc
} from 'lucide-react';

// ============================================================================
// ROLE SELECTION CARD
// ============================================================================
export function RoleCard({ icon, title, subtitle, color, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`group p-12 bg-gradient-to-br ${color} text-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-4 border-white transform relative overflow-hidden`}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-4xl font-bold mb-2">{title}</h3>
        <p className="text-lg opacity-90">{subtitle}</p>
      </div>
      
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-20 rounded-bl-full" />
    </button>
  );
}

// ============================================================================
// EXAM TYPE CARD
// ============================================================================
export function ExamCard({ title, desc, subjects, color, icon, onClick, stats }) {
  return (
    <button 
      onClick={onClick} 
      className={`group p-8 bg-gradient-to-br ${color} text-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-4 border-white transform relative overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
      </div>
      
      <div className="relative z-10">
        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-3xl font-bold mb-2">{title}</h3>
        <p className="text-sm mb-4 opacity-90">{desc}</p>
        
        {/* Subjects tags */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {subjects.map(s => (
            <span key={s} className="px-3 py-1 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-sm font-bold shadow-lg">
              {s}
            </span>
          ))}
        </div>
        
        {/* Stats if provided */}
        {stats && (
          <div className="mt-4 pt-4 border-t border-white border-opacity-30">
            <p className="text-xs opacity-75">{stats.students} študentov • {stats.examples} príkladov</p>
          </div>
        )}
      </div>
      
      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-6 h-6" />
      </div>
    </button>
  );
}

// ============================================================================
// FEATURE BUTTON (for premium features)
// ============================================================================
export function FeatureBtn({ icon, label, color, onClick, locked = false, badge = null }) {
  return (
    <button 
      onClick={onClick} 
      disabled={locked}
      className={`group relative p-4 bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Badge (if new feature) */}
      {badge && !locked && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
          {badge}
        </div>
      )}
      
      {/* Lock icon */}
      {locked && (
        <div className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1">
          <Lock className="w-3 h-3" />
        </div>
      )}
      
      <div className="w-6 h-6 mx-auto mb-2 transform group-hover:scale-125 transition-transform duration-300">
        {icon}
      </div>
      <span className="text-xs font-bold block">{label}</span>
    </button>
  );
}

// ============================================================================
// FEATURE HIGHLIGHT (for home page)
// ============================================================================
export function FeatureHighlight({ icon, text, color }) {
  return (
    <div className={`p-4 bg-gradient-to-br ${color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <span className="font-bold text-sm">{text}</span>
      </div>
    </div>
  );
}

// ============================================================================
// PRICING CARD
// ============================================================================
export function PricingCard({ plan, onSelect }) {
  return (
    <div className={`bg-white rounded-3xl shadow-2xl p-6 ${plan.popular ? 'border-4 ' + plan.borderColor + ' transform scale-105' : 'border-2 ' + plan.borderColor} relative`}>
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-10">
          ⭐ NAJOBĽÚBENEJŠÍ
        </div>
      )}
      
      {/* Icon */}
      <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center shadow-lg`}>
        <CreditCard className="w-10 h-10 text-white" />
      </div>
      
      {/* Name & Price */}
      <h3 className="text-3xl font-bold text-center mb-2">{plan.name}</h3>
      <div className="text-center mb-6">
        <span className="text-5xl font-bold">{plan.price}</span>
        <span className="text-gray-600 text-lg">{plan.period}</span>
      </div>
      
      {/* Features list */}
      <ul className="space-y-3 mb-6 min-h-[400px]">
        {plan.features.map((f, j) => (
          <li key={j} className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              {f.included ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <XIcon className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>
            <span className={`text-sm ${f.included ? 'text-gray-800 font-medium' : 'text-gray-400 line-through'}`}>
              <span className="mr-1">{f.icon}</span>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
      
      {/* CTA Button */}
      <button 
        onClick={() => onSelect(plan.name)}
        className={`w-full py-4 bg-gradient-to-r ${plan.color} text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105`}
      >
        {plan.name === 'FREE' ? 'Aktuálny plán' : '🎁 Vyskúšať 7 dní'}
      </button>
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================
export function ProgressBar({ current, total, color = "from-blue-500 to-cyan-500", showLabel = true }) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-2 text-sm font-semibold">
          <span>{current} / {total}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
        <div 
          className={`h-4 bg-gradient-to-r ${color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================
export function Badge({ icon, text, color, size = "md" }) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };
  
  return (
    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${color} text-white ${sizeClasses[size]} rounded-full font-bold shadow-lg`}>
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================
export function StatCard({ icon, label, value, change, color }) {
  return (
    <div className={`p-6 bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-bold ${change > 0 ? 'text-green-200' : 'text-red-200'}`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-4xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

// ============================================================================
// MOCK TEST QUESTION CARD
// ============================================================================
export function MockTestQuestionCard({ number, question, answer, onChange, isAnswered }) {
  return (
    <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
      isAnswered 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
        : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 hover:border-blue-500'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          isAnswered ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {number}
        </div>
        <p className="font-bold text-lg flex-1">{question}</p>
      </div>
      <input
        type="text"
        value={answer || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg transition-colors"
        placeholder="Tvoja odpoveď..."
      />
      {isAnswered && (
        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
          <Check className="w-4 h-4" /> Odpovedané
        </p>
      )}
    </div>
  );
}

// ============================================================================
// LIBRARY EXAMPLE CARD
// ============================================================================
export function LibraryExampleCard({ example, onView, isFavorite, onToggleFavorite }) {
  const difficultyColors = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-red-100 text-red-700'
  };
  
  return (
    <div className="group p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-xl hover:from-purple-100 hover:to-red-100 cursor-pointer border-2 border-purple-300 hover:border-purple-500 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-lg text-purple-900 flex-1">{example.title}</h4>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="flex-shrink-0"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`} />
        </button>
      </div>
      
      <p className="text-purple-700 mb-3 line-clamp-2">{example.solution}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-purple-600 font-bold px-2 py-1 bg-purple-200 rounded-full">
            {example.topic}
          </span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${difficultyColors[example.difficulty]}`}>
            {'⭐'.repeat(example.difficulty)}
          </span>
        </div>
        <button 
          onClick={onView}
          className="text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Zobraziť <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// LEADERBOARD ROW
// ============================================================================
export function LeaderboardRow({ rank, name, points, isYou, badge }) {
  const rankColors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-400 to-orange-600'
  };
  
  const rankEmojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
      isYou 
        ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-500 shadow-lg scale-105' 
        : rank <= 3
        ? `bg-gradient-to-r ${rankColors[rank]} text-white border-transparent shadow-md`
        : 'bg-white border-gray-300 hover:border-gray-400'
    }`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
        rank <= 3 ? 'bg-white bg-opacity-30' : isYou ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}>
        {rankEmojis[rank] || rank}
      </div>
      
      <div className="flex-1">
        <div className="font-bold text-lg">{name}</div>
        {badge && (
          <div className="text-xs opacity-75">{badge}</div>
        )}
      </div>
      
      <div className="flex-shrink-0 text-right">
        <div className="font-bold text-xl">{points}</div>
        <div className="text-xs opacity-75">bodov</div>
      </div>
      
      {isYou && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          TY
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STUDY PLAN DAY CARD
// ============================================================================
export function StudyPlanDayCard({ day, title, tasks, isCompleted, isToday, onToggleTask }) {
  return (
    <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
      isCompleted 
        ? 'bg-green-50 border-green-400' 
        : isToday
        ? 'bg-blue-50 border-blue-500 shadow-lg scale-105'
        : 'bg-white border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">Deň {day}</div>
          <h4 className="font-bold text-lg">{title}</h4>
        </div>
        {isCompleted && (
          <div className="bg-green-500 text-white rounded-full p-1">
            <Check className="w-5 h-5" />
          </div>
        )}
        {isToday && !isCompleted && (
          <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            DNES
          </div>
        )}
      </div>
      
      <ul className="space-y-2">
        {tasks.map((task, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleTask(day, i)}
              className="w-4 h-4 rounded"
            />
            <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT BADGE
// ============================================================================
export function AchievementBadge({ icon, title, description, unlocked, progress }) {
  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
      unlocked 
        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-500 shadow-lg' 
        : 'bg-gray-100 border-gray-300 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
          unlocked ? 'bg-yellow-500' : 'bg-gray-400'
        }`}>
          {unlocked ? icon : '🔒'}
        </div>
        <div className="flex-1">
          <h4 className="font-bold">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
          {!unlocked && progress && (
            <div className="mt-2">
              <ProgressBar current={progress.current} total={progress.total} showLabel={false} />
              <p className="text-xs text-gray-500 mt-1">{progress.current}/{progress.total}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NOTIFICATION BADGE
// ============================================================================
export function NotificationBadge({ count, color = "bg-red-500" }) {
  if (count === 0) return null;
  
  return (
    <div className={`absolute -top-2 -right-2 ${color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg min-w-[20px] text-center`}>
      {count > 99 ? '99+' : count}
    </div>
  );
}

// ============================================================================
// WEEKLY CHALLENGE CARD
// ============================================================================
export function WeeklyChallengeCard({ challenge, progress, onViewDetails }) {
  const percentage = Math.round((progress.current / progress.total) * 100);
  const isCompleted = percentage >= 100;
  
  return (
    <div className={`p-6 rounded-2xl border-2 ${
      isCompleted 
        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-500' 
        : 'bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-500'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl mb-1">{challenge.title}</h3>
          <p className="text-sm text-gray-600">{challenge.description}</p>
        </div>
        <div className="text-3xl">
          {isCompleted ? '🏆' : '🎯'}
        </div>
      </div>
      
      <div className="mb-4">
        <ProgressBar 
          current={progress.current} 
          total={progress.total} 
          color={isCompleted ? "from-green-500 to-emerald-500" : "from-yellow-500 to-orange-500"}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          Odmena: <span className="text-yellow-600">{challenge.reward}</span>
        </div>
        {!isCompleted && (
          <div className="text-sm text-gray-600">
            Zostáva: {challenge.timeLeft}
          </div>
        )}
      </div>
      
      {isCompleted && (
        <button 
          onClick={onViewDetails}
          className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
        >
          🎉 Vyzdvihnúť odmenu
        </button>
      )}
    </div>
  );
}

// ============================================================================
// CHAT MESSAGE BUBBLE
// ============================================================================
export function ChatMessage({ message, isUser, timestamp }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`p-4 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-br-none' 
            : 'bg-white border-2 border-gray-300 rounded-bl-none'
        } shadow-lg`}>
          <p className="whitespace-pre-line">{message}</p>
        </div>
        {timestamp && (
          <p className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'} text-gray-500`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TIMER DISPLAY
// ============================================================================
export function TimerDisplay({ seconds, warning = false }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return (
    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-3xl font-bold shadow-lg ${
      warning 
        ? 'bg-red-100 text-red-600 border-2 border-red-500 animate-pulse' 
        : 'bg-blue-100 text-blue-600 border-2 border-blue-400'
    }`}>
      <Clock className="w-8 h-8" />
      <span>{mins}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
}

// ============================================================================
// TOPIC FILTER CHIP
// ============================================================================
export function TopicFilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110' 
          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 ${active ? 'text-white' : 'text-gray-500'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

// ============================================================================
// DIFFICULTY SELECTOR
// ============================================================================
export function DifficultySelector({ value, onChange }) {
  const difficulties = [
    { level: 1, label: 'Ľahké', color: 'from-green-400 to-emerald-400', emoji: '😊' },
    { level: 2, label: 'Stredné', color: 'from-yellow-400 to-orange-400', emoji: '🤔' },
    { level: 3, label: 'Ťažké', color: 'from-red-400 to-pink-400', emoji: '😰' }
  ];
  
  return (
    <div className="flex gap-3">
      {difficulties.map(d => (
        <button
          key={d.level}
          onClick={() => onChange(d.level)}
          className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
            value === d.level 
              ? `bg-gradient-to-r ${d.color} text-white border-transparent shadow-lg scale-105` 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-2xl mb-1">{d.emoji}</div>
          <div className="font-bold">{d.label}</div>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// STREAK DISPLAY
// ============================================================================
export function StreakDisplay({ current, longest }) {
  return (
    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-2xl border-2 border-orange-400">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 mb-1">Aktuálna šnúra</div>
          <div className="text-4xl font-bold text-orange-600 flex items-center gap-2">
            🔥 {current} {current === 1 ? 'deň' : current < 5 ? 'dni' : 'dní'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Najdlhšia šnúra</div>
          <div className="text-2xl font-bold text-gray-700">
            ⭐ {longest} {longest === 1 ? 'deň' : longest < 5 ? 'dni' : 'dní'}
          </div>
        </div>
      </div>
      
      {current >= 7 && (
        <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-400">
          <p className="text-sm font-semibold text-yellow-800">
            🎉 Skvelé! Držíš {current}-dňovú šnúru! Nezabudni sa učiť aj zajtra!
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODAL WRAPPER
// ============================================================================
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================
export function LoadingSpinner({ size = 'md', text }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
      {text && (
        <p className="mt-4 text-gray-600 font-semibold">{text}</p>
      )}
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && action}
    </div>
  );
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================
export function Toast({ message, type = 'info', onClose }) {
  const types = {
    success: { bg: 'from-green-500 to-emerald-500', icon: <Check className="w-6 h-6" /> },
    error: { bg: 'from-red-500 to-pink-500', icon: <XCircle className="w-6 h-6" /> },
    warning: { bg: 'from-yellow-500 to-orange-500', icon: <AlertCircle className="w-6 h-6" /> },
    info: { bg: 'from-blue-500 to-cyan-500', icon: <Sparkles className="w-6 h-6" /> }
  };
  
  const config = types[type];
  
  return (
    <div className={`fixed bottom-6 right-6 bg-gradient-to-r ${config.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50`}>
      {config.icon}
      <p className="font-semibold">{message}</p>
      <button onClick={onClose} className="ml-4">
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-up {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(style);
