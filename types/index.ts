export interface Topic {
    id: string;
    title: string;
    duration: number; // in minutes
    notes: string;
    description: string;
    type: 'presentation' | 'discussion' | 'decision' | 'break';
    isCompleted: boolean;
    isDeleted: boolean;
    completedAt?: string | null;
    ownerId?: string;
    ownerName?: string;
    createdAt: string;
}

export interface ActionItem {
    id: string;
    topicId: string;
    meetingId: string;
    meetingOwnerId?: string; // Denormalized for collectionGroup queries
    meetingTitle: string;
    topicTitle: string;
    title: string;
    ownerName: string;
    ownerId?: string;
    dueDate: string; // ISO string 
    isCompleted: boolean;
    meetingScheduledAt?: string; // ISO string 
    comments?: string; // Progress updates
    createdAt: string;
}

export interface Meeting {
    id: string;
    ownerId: string;
    title: string;
    status: 'planning' | 'running' | 'ended';
    scheduledAt: string; // ISO string or Firestore Timestamp (converted to ISO for consistency)
    timezone: string;
    scheduledDuration: number; // in minutes
    topicOrder: string[]; // Array of topic IDs
    startedAt: string | null;
    isDeleted: boolean;
    isArchived: boolean;
    guestAccess: boolean;
    createdAt: string;
    searchKeywords?: string; // Concatenated titles and owners of topics for search
}

export interface Comment {
    id: string;
    actionItemId?: string;
    topicId?: string; // For potential future use or direct topic comments
    content: string; // Markdown/Text
    authorId: string;
    authorName: string;
    createdAt: string; // ISO string
    parentId?: string | null; // For threaded replies
    mentions: string[]; // Array of user IDs/Names mentioned
    updatedAt?: string;
}
