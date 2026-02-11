/**
 * ChatScreen
 * ──────────
 * AI chat interface with task context. Users can ask about their tasks,
 * get productivity tips, and receive contextual advice.
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { sendChatMessage } from '../services/api';

const ChatScreen = () => {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content:
                "Hi! 👋 I'm your Task Tracker assistant. I can see all your tasks and help you with:\n\n• Task prioritization\n• Progress advice\n• Time management tips\n\nAsk me anything!",
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        const userMsg = { id: Date.now().toString(), role: 'user', content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setSending(true);

        try {
            // Build history for context (exclude welcome message)
            const history = messages
                .filter((m) => m.id !== 'welcome')
                .map((m) => ({ role: m.role, content: m.content }));

            const { reply } = await sendChatMessage(trimmed, history);
            const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '⚠️ Sorry, I could not process that. Please check your connection and try again.',
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                {!isUser && <Text style={styles.aiLabel}>🤖 AI</Text>}
                <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.inputBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask about your tasks…"
                    placeholderTextColor="#9CA3AF"
                    value={input}
                    onChangeText={setInput}
                    editable={!sending}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!input.trim() || sending}
                    activeOpacity={0.8}
                >
                    <Text style={styles.sendButtonText}>{sending ? '…' : '➤'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
    },
    userBubble: {
        backgroundColor: '#4F46E5',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    aiLabel: {
        fontSize: 11,
        color: '#6366F1',
        fontWeight: '600',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 21,
    },
    userText: {
        color: '#FFFFFF',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#111827',
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.4,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default ChatScreen;
