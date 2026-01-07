"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import ConversationList from '@/components/inbox/ConversationList';
import ConversationHeader from '@/components/inbox/ConversationHeader';
import MessageThread from '@/components/inbox/MessageThread';
import ReplyInput from '@/components/inbox/ReplyInput';
import SmartReplySuggestions from '@/components/inbox/SmartReplySuggestions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { useConversations, type Conversation } from '@/hooks/useConversations';
import { useMessageThread } from '@/hooks/useMessageThread';
import { useQuotes } from '@/hooks/useQuotes';
import { usePhoneNumber } from '@/hooks/usePhoneNumber';
import { useSmartReplies } from '@/hooks/useSmartReplies';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  const router = useRouter();
  const { conversations, loading: loadingConversations } = useConversations();
  const { updateQuoteStatus } = useQuotes();
  const { phoneNumber, loading: loadingPhone } = usePhoneNumber();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  const { 
    messages, 
    loading: loadingMessages, 
    sending, 
    sendReply 
  } = useMessageThread(selectedConversation?.id || null);

  const {
    loading: aiLoading,
    suggestions,
    generateReplies,
    clearSuggestions,
  } = useSmartReplies();

  // Generate AI suggestions when a new inbound message is selected
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.direction === 'inbound') {
        generateReplies(
          lastMessage.content,
          undefined,
          selectedConversation.id
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, selectedConversation?.id, generateReplies]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    clearSuggestions();
  };

  const handleBack = () => {
    setSelectedConversation(null);
    clearSuggestions();
  };

  const handleViewQuote = () => {
    if (selectedConversation) {
      router.push(`/quotes?id=${selectedConversation.id}`);
    }
  };

  const handlePauseResume = async () => {
    if (!selectedConversation) return;
    
    const newStatus = selectedConversation.status === 'paused' ? 'active' : 'paused';
    await updateQuoteStatus(selectedConversation.id, newStatus);
    
    setSelectedConversation({
      ...selectedConversation,
      status: newStatus,
    });
  };

  const handleMarkWon = async () => {
    if (!selectedConversation) return;
    
    await updateQuoteStatus(selectedConversation.id, 'won');
    
    setSelectedConversation({
      ...selectedConversation,
      status: 'won',
    });
  };

  const handleSelectSuggestion = async (text: string) => {
    const result = await sendReply(text);
    if (!result.error) {
      clearSuggestions();
    }
  };

  const handleRegenerate = () => {
    if (messages.length > 0 && selectedConversation) {
      const lastInbound = [...messages].reverse().find(m => m.direction === 'inbound');
      if (lastInbound) {
        generateReplies(
          lastInbound.content,
          undefined,
          selectedConversation.id
        );
      }
    }
  };
  
  const handleFeedback = () => {
    // Feedback handling
  };

  const isLoading = loadingConversations || loadingPhone;

  // No phone number configured
  if (!loadingPhone && !phoneNumber) {
    return (
      <Layout title="Inbox">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="card-elevated p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon name="phone" size="3xl" className="text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Set up your phone number
            </h2>
            <p className="text-gray-500 mb-6">
              You need a phone number to send and receive messages. 
              Set one up in Settings to get started.
            </p>
            <Button 
              onClick={() => router.push('/settings?tab=communications')}
              className="bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
            >
              Go to Settings
              <Icon name="arrowRight" size="sm" className="ml-2" />
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Inbox">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
            <Icon name="inbox" size="xl" className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
              <Badge className="bg-primary/10 text-primary border-0">
                <Icon name="robot" size="xs" className="mr-1" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-gray-500">Manage customer conversations with AI assistance</p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="card-elevated h-[calc(100vh-14rem)] flex overflow-hidden">
          {/* Conversation list */}
          <div
            className={cn(
              'w-full lg:w-80 xl:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50',
              selectedConversation && 'hidden lg:flex'
            )}
          >
            <div className="p-5 border-b border-gray-100 bg-white">
              <h2 className="font-semibold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-500">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="spinner" size="xl" className="animate-spin text-primary" />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id || null}
                  onSelect={handleSelectConversation}
                />
              )}
            </div>
          </div>

          {/* Message thread */}
          <div
            className={cn(
              'flex-1 flex flex-col bg-white',
              !selectedConversation && 'hidden lg:flex'
            )}
          >
            {selectedConversation ? (
              <>
                <ConversationHeader
                  conversation={selectedConversation}
                  onBack={handleBack}
                  onViewQuote={handleViewQuote}
                  onPauseResume={handlePauseResume}
                  onMarkWon={handleMarkWon}
                />

                <MessageThread
                  messages={messages}
                  loading={loadingMessages}
                />

                {selectedConversation.status === 'won' || selectedConversation.status === 'lost' ? (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 text-center">
                    <p className="text-sm text-gray-500">
                      This quote has been marked as <span className="font-medium">{selectedConversation.status}</span>.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* AI Smart Reply Suggestions */}
                    <SmartReplySuggestions
                      suggestions={suggestions}
                      loading={aiLoading}
                      onSelectSuggestion={handleSelectSuggestion}
                      onRegenerate={handleRegenerate}
                      onFeedback={handleFeedback}
                      onDismiss={clearSuggestions}
                    />

                    <ReplyInput
                      onSend={sendReply}
                      sending={sending}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Icon name="message" size="3xl" className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Choose a conversation from the list to view messages and respond with AI-powered suggestions
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
