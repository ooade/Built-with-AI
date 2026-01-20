import React, { useEffect, useRef } from 'react';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';

interface ChatMessage {
	text: string;
	isMe: boolean;
}

interface ChatProps {
	messages: ChatMessage[];
	onSendMessage: (text: string) => void;
	opponentName: string;
	onBack?: () => void; // Optional: Only for mobile toggle
	className?: string;
}

const Chat: React.FC<ChatProps> = ({
	messages,
	onSendMessage,
	opponentName,
	onBack,
	className = '',
}) => {
	const [input, setInput] = React.useState('');
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			onSendMessage(input.trim());
			setInput('');
		}
	};

	return (
		<div
			className={`flex flex-col bg-black/10 rounded-2xl overflow-hidden border border-white/5 ${className}`}
		>
			{/* Header */}
			<div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-white/5 shrink-0">
				{onBack && (
					<button
						onClick={onBack}
						className="p-1.5 -ml-2 rounded-full hover:bg-white/10 text-white/70 transition-colors"
						type="button"
					>
						<ArrowLeft size={18} />
					</button>
				)}
				<div className="flex items-center gap-2">
					<MessageSquare size={14} className="text-white/40" />
					<span className="text-[10px] font-bold text-white/40 tracking-widest uppercase truncate max-w-[150px]">
						Chatting with {opponentName}
					</span>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
				{messages.length === 0 && (
					<div className="h-full flex flex-col items-center justify-center text-white/10 text-xs italic">
						<p>No messages yet</p>
					</div>
				)}
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
					>
						<div
							className={`max-w-[90%] rounded-[14px] px-3 py-2 text-sm break-words leading-relaxed ${
								msg.isMe
									? 'bg-blue-500/20 text-blue-100 border border-blue-500/10 rounded-br-sm'
									: 'bg-white/5 text-white/80 border border-white/5 rounded-bl-sm'
							}`}
						>
							{msg.text}
						</div>
					</div>
				))}
				<div ref={endRef} />
			</div>

			{/* Input */}
			<form
				onSubmit={handleSubmit}
				className="p-2 border-t border-white/5 bg-black/10 flex gap-2 shrink-0"
			>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type..."
					className="flex-1 bg-transparent text-sm text-white px-3 py-2 focus:outline-none placeholder:text-white/20"
				/>
				<button
					type="submit"
					disabled={!input.trim()}
					className="p-2 text-blue-400 disabled:text-white/10 hover:text-blue-300 transition-colors"
				>
					<Send size={16} />
				</button>
			</form>
		</div>
	);
};

export default Chat;
