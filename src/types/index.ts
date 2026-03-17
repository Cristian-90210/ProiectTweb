export type UserRole = 'admin' | 'student' | 'coach';

export interface Booking {
    id: string;
    studentId: string;
    coachId: string;
    courseId: string;
    date: string; // ISO Date YYYY-MM-DD
    time: string; // HH:mm
    status: 'upcoming' | 'completed' | 'cancelled';
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export interface Student {
    id: string;
    name: string;
    age: number;
    email: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    status: 'Active' | 'Inactive'; // Ensure status is here
    enrolledCourseId?: string;
    role: 'student'; // Add discriminator
    avatar?: string; // Add optional avatar
}

export type MedicalFlagType = 'asthma' | 'chlorine_allergy' | 'other';
export type MedicalFlagSeverity = 'low' | 'medium' | 'high';

export interface StudentHealthFlag {
    id: string;
    studentId: string;
    type: MedicalFlagType;
    severity: MedicalFlagSeverity;
    protocolText: string;
    isActive: boolean;
}

export interface Admin {
    id: string;
    name: string;
    email: string;
    role: 'admin';
    avatar?: string;
    status: 'Active' | 'Inactive';
}

export type AnyUser = Student | Coach | Admin;

export interface Announcement {
    id: string;
    title: { en: string; ro: string; ru: string };
    message: { en: string; ro: string; ru: string };
    date: string;
    target: 'all' | 'students' | 'coaches';
    authorId: string;
}

export interface Coach {
    id: string;
    name: string;
    specialization: string;
    experienceYears: number;
    email: string;
    avatar?: string;
    status: 'Active' | 'Inactive';
    role: 'coach'; // Add discriminator
    imagePosition?: 'top' | 'center' | 'bottom';
}

export interface Course {
    id: string;
    title: string;
    description: string;
    capacity: number;
    enrolled: number;
    coachId: string;
    schedule: string; // e.g., "Mon, Wed 18:00"
    price: number;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Enrollment Types
export interface TimeSlot {
    time: string;
    isAvailable: boolean;
}

export interface DayAvailability {
    date: string; // ISO string YYYY-MM-DD
    slots: TimeSlot[];
}

export type SwimStyle = 'freestyle' | 'backstroke' | 'butterfly' | 'breaststroke';
export type SwimDistance = '25m' | '50m' | '100m' | '200m';

export interface SwimmingResult {
    id: string;
    studentId: string;
    coachId: string;
    style: SwimStyle;
    distance: SwimDistance;
    time: string; // e.g. "00:32.45"
    date: string; // ISO Date
    notes?: string;
}

export interface AttendanceRecord {
    id: string;
    bookingId: string;
    studentId: string;
    date: string;
    status: 'present' | 'absent' | 'absent_medical' | 'recovery' | 'late';
    markedBy: string; // coach or admin id
    confirmed?: boolean;
    confirmedBy?: string;
    confirmedAt?: string;
    submittedByStudent?: boolean;
    note?: string;
}

export interface RecoveryCredit {
    id: string;
    studentId: string;
    sourceAttendanceId: string;
    status: 'active' | 'reserved' | 'consumed' | 'expired';
    expiresAt: string;
    consumedSessionId?: string;
}

export interface RecoveryRequest {
    id: string;
    studentId: string;
    date: string;
    status: 'pending' | 'confirmed' | 'rejected';
    requestedAt: string;
    confirmedBy?: string;
    confirmedAt?: string;
}

export interface ProgressSnapshot {
    id: string;
    studentId: string;
    metricKey: string;
    metricValue: number; // 0..100
    recordedAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    receiverName: string;
    content: string;
    timestamp: string;
    read: boolean;
}

export interface Subscription {
    id: string;
    planId: string;
    studentId: string;
    studentName: string;
    paidDate: string;
    amount: number;
    sessionsTotal: number;
    sessionsUsed: number;
    expiryDate: string;
}

export interface CoachScheduleSlot {
    id: string;
    coachId: string;
    coachName: string;
    dayOfWeek: string; // 'Monday', 'Tuesday', etc.
    startTime: string;
    endTime: string;
    maxStudents: number;
    currentStudents: number;
}

export interface SpecialOffer {
    id: string;
    studentId: string;
    studentName: string;
    title: string;
    description: string;
    discount: number; // percentage
    validUntil: string;
    sentBy: string;
    sentByName: string;
    sentDate: string;
}

export interface StudentNote {
    id: string;
    studentId: string;
    studentName: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
}
