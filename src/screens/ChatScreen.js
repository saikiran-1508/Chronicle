/**
 * ChatScreen — Theme-aware
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
import { useTheme } from '../context/ThemeContext';

const ChatScreen = () => {
    const { colors } = useTheme();
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content:
                "Hi! I'm your Chronicle assistant. I can see all your tasks and help you with:\n\n• Task prioritization\n• Progress advice\n• Time management tips\n\nAsk me anything!",
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
                content: 'Sorry, I could not process that. Please check your connection and try again.',
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser
                    ? [styles.userBubble, { backgroundColor: colors.buttonBg }]
                    : [styles.aiBubble, { backgroundColor: colors.inputBg }],
            ]}>
                {!isUser && <Text style={[styles.aiLabel, { color: colors.textMuted }]}>AI</Text>}
                <Text style={[styles.messageText, isUser ? { color: colors.buttonText } : { color: colors.textSecondary }]}>
                    {item.content}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
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

            <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.divider }]}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, color: colors.inputText }]}
                    placeholder="Ask about your tasks..."
                    placeholderTextColor={colors.textPlaceholder}
                    value={input}
                    onChangeText={setInput}
                    editable={!sending}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                />
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: colors.buttonBg }, (!input.trim() || sending) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!input.trim() || sending}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.sendButtonText, { color: colors.buttonText }]}>{sending ? '...' : '>'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    messagesList: { padding: 16, paddingBottom: 8 },
    messageBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
    },
    userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    aiLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
    messageText: { fontSize: 15, lineHeight: 21 },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: { opacity: 0.4 },
    sendButtonText: { fontSize: 18, fontWeight: '700' },
});

export default ChatScreen;
