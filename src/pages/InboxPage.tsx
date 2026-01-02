import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ConversationList from '@/components/inbox/ConversationList';
import ConversationHeader from '@/components/inbox/ConversationHeader';
import MessageThread from '@/components/inbox/MessageThread';
import ReplyInput from '@/components/inbox/ReplyInput';
import { Card } from '@/components/ui/card';
import { useConversations, type Conversation } from '@/hooks/useConversations';
import { useMessageThread } from '@/hooks/useMessageThread';
import { useQuotes } from '@/hooks/useQuotes';
import { usePhoneNumber } from '@/hooks/usePhoneNumber';
import { Loader2, MessageSquare, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  const navigate = useNavigate();
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

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleViewQuote = () => {
    if (selectedConversation) {
      navigate(`/quotes?id=${selectedConversation.id}`);
    }
  };

  const handlePauseResume = async () => {
    if (!selectedConversation) return;
    
    const newStatus = selectedConversation.status === 'paused' ? 'active' : 'paused';
    await updateQuoteStatus(selectedConversation.id, newStatus);
    
    // Update local state
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

  const isLoading = loadingConversations || loadingPhone;

  // No phone number configured
  if (!loadingPhone && !phoneNumber) {
    return (
      <Layout title="Inbox">
        <Card className="p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Set up your phone number
          </h2>
          <p className="text-muted-foreground mb-6">
            You need a phone number to send and receive messages. 
            Set one up in Settings to get started.
          </p>
          <Button onClick={() => navigate('/settings')}>
            Go to Settings
          </Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Inbox">
      <Card className="h-[calc(100vh-8rem)] flex overflow-hidden">
        {/* Conversation list */}
        <div
          className={cn(
            'w-full lg:w-80 xl:w-96 border-r border-border flex flex-col',
            selectedConversation && 'hidden lg:flex'
          )}
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Messages</h2>
            <p className="text-sm text-muted-foreground">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
            'flex-1 flex flex-col',
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
                <div className="border-t border-border p-4 bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    This quote has been marked as {selectedConversation.status}.
                  </p>
                </div>
              ) : (
                <ReplyInput
                  onSend={sendReply}
                  sending={sending}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose a conversation from the list to view messages
              </p>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
}
