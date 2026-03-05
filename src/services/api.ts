import type { Student, Course, Coach, AnyUser, Announcement, SwimmingResult, AttendanceRecord, Message, Subscription, CoachScheduleSlot, SpecialOffer, StudentNote } from '../types';
import { mockStudents, mockCourses, mockCoaches, mockAdmins, mockAnnouncements, mockBookings, mockSwimmingResults, mockAttendance, mockMessages, mockSubscriptions, mockCoachSchedule, mockSpecialOffers, mockStudentNotes } from '../data/mockData';

// Simulate async API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const studentService = {
    getAll: async (): Promise<Student[]> => {
        await delay(500);
        return [...mockStudents];
    },
    getById: async (id: string): Promise<Student | undefined> => {
        await delay(300);
        return mockStudents.find(s => s.id === id);
    },
    create: async (student: Student): Promise<Student> => {
        await delay(600);
        console.log('Created student:', student);
        return student;
    },
    update: async (id: string, updates: Partial<Student>): Promise<Student> => {
        await delay(500);
        console.log('Updated student:', id, updates);
        const student = mockStudents.find(s => s.id === id);
        if (!student) throw new Error('Student not found');
        return { ...student, ...updates };
    },
    delete: async (id: string): Promise<void> => {
        await delay(400);
        console.log('Deleted student:', id);
    }
};

export const courseService = {
    getAll: async (): Promise<Course[]> => {
        await delay(500);
        return [...mockCourses];
    }
};

export const coachService = {
    getAll: async (): Promise<Coach[]> => {
        await delay(500);
        return [...mockCoaches];
    }
};

export const userService = {
    getAll: async (): Promise<AnyUser[]> => {
        await delay(600);
        const students = mockStudents.map(s => ({ ...s, role: 'student' as const }));
        const coaches = mockCoaches.map(c => ({ ...c, role: 'coach' as const }));
        const admins = mockAdmins.map(a => ({ ...a, role: 'admin' as const }));
        return [...students, ...coaches, ...admins];
    },
    updateStatus: async (id: string, status: 'Active' | 'Inactive') => {
        await delay(400);
        console.log(`User ${id} status updated to ${status}`);
    },
    changeRole: async (id: string, newRole: string) => {
        await delay(500);
        console.log(`User ${id} role changed to ${newRole}`);
    }
};

export const reservationService = {
    getAll: async (): Promise<import('../types').Booking[]> => {
        await delay(500);
        return [...mockBookings];
    },
    updateStatus: async (id: string, status: 'upcoming' | 'completed' | 'cancelled') => {
        await delay(300);
        console.log(`Booking ${id} status updated to ${status}`);
    }
};

export const announcementService = {
    getAll: async (): Promise<Announcement[]> => {
        await delay(400);
        return [...mockAnnouncements];
    },
    send: async (announcement: Omit<Announcement, 'id' | 'date' | 'authorId'>) => {
        await delay(600);
        console.log('Announcement sent:', announcement);
        return {
            ...announcement,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            authorId: 'admin-1'
        };
    }
};

export const attendanceService = {
    getAll: async (): Promise<AttendanceRecord[]> => {
        await delay(400);
        return [...mockAttendance];
    },
    getByStudent: async (studentId: string): Promise<AttendanceRecord[]> => {
        await delay(300);
        return mockAttendance.filter(a => a.studentId === studentId);
    },
    mark: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
        await delay(400);
        const newRecord = { ...record, id: 'att' + Math.random().toString(36).substr(2, 6) };
        console.log('Attendance marked:', newRecord);
        return newRecord;
    }
};

export const resultsService = {
    getAll: async (): Promise<SwimmingResult[]> => {
        await delay(400);
        return [...mockSwimmingResults];
    },
    getByStudent: async (studentId: string): Promise<SwimmingResult[]> => {
        await delay(300);
        return mockSwimmingResults.filter(r => r.studentId === studentId);
    },
    create: async (result: Omit<SwimmingResult, 'id'>): Promise<SwimmingResult> => {
        await delay(500);
        const newResult = { ...result, id: 'r' + Math.random().toString(36).substr(2, 6) };
        console.log('Result created:', newResult);
        return newResult;
    },
    update: async (id: string, updates: Partial<SwimmingResult>): Promise<SwimmingResult> => {
        await delay(400);
        const result = mockSwimmingResults.find(r => r.id === id);
        if (!result) throw new Error('Result not found');
        console.log('Result updated:', id, updates);
        return { ...result, ...updates };
    }
};

export const messageService = {
    getAll: async (): Promise<Message[]> => {
        await delay(300);
        return [...mockMessages];
    },
    getByUser: async (userId: string): Promise<Message[]> => {
        await delay(300);
        return mockMessages.filter(m => m.senderId === userId || m.receiverId === userId);
    },
    send: async (message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<Message> => {
        await delay(400);
        const newMsg: Message = {
            ...message,
            id: 'm' + Math.random().toString(36).substr(2, 6),
            timestamp: new Date().toISOString(),
            read: false
        };
        console.log('Message sent:', newMsg);
        return newMsg;
    }
};

export const subscriptionService = {
    getAll: async (): Promise<Subscription[]> => {
        await delay(400);
        return [...mockSubscriptions];
    },
    getByStudent: async (studentId: string): Promise<Subscription | undefined> => {
        await delay(300);
        return mockSubscriptions.find(s => s.studentId === studentId);
    }
};

export const scheduleService = {
    getAll: async (): Promise<CoachScheduleSlot[]> => {
        await delay(400);
        return [...mockCoachSchedule];
    },
    getByCoach: async (coachId: string): Promise<CoachScheduleSlot[]> => {
        await delay(300);
        return mockCoachSchedule.filter(s => s.coachId === coachId);
    },
    update: async (id: string, updates: Partial<CoachScheduleSlot>): Promise<CoachScheduleSlot> => {
        await delay(400);
        const slot = mockCoachSchedule.find(s => s.id === id);
        if (!slot) throw new Error('Schedule slot not found');
        console.log('Schedule updated:', id, updates);
        return { ...slot, ...updates };
    },
    create: async (slot: Omit<CoachScheduleSlot, 'id'>): Promise<CoachScheduleSlot> => {
        await delay(500);
        const newSlot = { ...slot, id: 'sch' + Math.random().toString(36).substr(2, 6) };
        console.log('Schedule slot created:', newSlot);
        return newSlot;
    }
};

export const offerService = {
    getAll: async (): Promise<SpecialOffer[]> => {
        await delay(400);
        return [...mockSpecialOffers];
    },
    send: async (offer: Omit<SpecialOffer, 'id' | 'sentDate'>): Promise<SpecialOffer> => {
        await delay(500);
        const newOffer: SpecialOffer = {
            ...offer,
            id: 'off' + Math.random().toString(36).substr(2, 6),
            sentDate: new Date().toISOString()
        };
        console.log('Special offer sent:', newOffer);
        return newOffer;
    }
};

export const noteService = {
    getAll: async (): Promise<StudentNote[]> => {
        await delay(400);
        return [...mockStudentNotes];
    },
    getByStudent: async (studentId: string): Promise<StudentNote[]> => {
        await delay(300);
        return mockStudentNotes.filter(n => n.studentId === studentId);
    },
    create: async (note: Omit<StudentNote, 'id' | 'createdAt'>): Promise<StudentNote> => {
        await delay(400);
        const newNote: StudentNote = {
            ...note,
            id: 'n' + Math.random().toString(36).substr(2, 6),
            createdAt: new Date().toISOString()
        };
        console.log('Note created:', newNote);
        return newNote;
    }
};

export const serverStatusService = {
    healthCheck: async (): Promise<{ status: string }> => {
        await delay(1000);
        throw new Error('500 Internal Server Error: Mock database connection failed');
    },
};
