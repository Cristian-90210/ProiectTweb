import type { Student, Course, Coach, AnyUser, Announcement, SwimmingResult, AttendanceRecord, Message, Subscription, CoachScheduleSlot, SpecialOffer, StudentNote, RecoveryCredit, StudentHealthFlag, ProgressSnapshot, RecoveryRequest } from '../types';
import { mockStudents, mockCourses, mockCoaches, mockAdmins, mockAnnouncements, mockBookings, mockSwimmingResults, mockAttendance, mockMessages, mockSubscriptions, mockCoachSchedule, mockSpecialOffers, mockStudentNotes, mockRecoveryCredits, mockStudentHealthFlags, mockProgressSnapshots } from '../data/mockData';

// Simulate async API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const ATTENDANCE_STORAGE_KEY = 'attendance_store_v2';
const RECOVERY_STORAGE_KEY = 'recovery_store_v1';
const RECOVERY_REQUEST_STORAGE_KEY = 'recovery_request_store_v1';

const loadFromStorage = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage failures in mock API
    }
};

const attendanceStore: AttendanceRecord[] = loadFromStorage(ATTENDANCE_STORAGE_KEY, [...mockAttendance]);
const recoveryStore: RecoveryCredit[] = loadFromStorage(RECOVERY_STORAGE_KEY, [...mockRecoveryCredits]);
const recoveryRequestStore: RecoveryRequest[] = loadFromStorage(RECOVERY_REQUEST_STORAGE_KEY, []);

// ── localStorage-backed student persistence ──
const STUDENTS_KEY = 'students';

function getStoredStudents(): Student[] {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (raw) {
        try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    // Seed localStorage with mock data on first visit
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(mockStudents));
    return [...mockStudents];
}

function saveStudents(students: Student[]): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export const studentService = {
    getAll: async (): Promise<Student[]> => {
        await delay(300);
        return getStoredStudents();
    },
    getById: async (id: string): Promise<Student | undefined> => {
        await delay(200);
        return getStoredStudents().find(s => s.id === id);
    },
    create: async (student: Student): Promise<Student> => {
        await delay(400);
        const students = getStoredStudents();
        students.push(student);
        saveStudents(students);
        return student;
    },
    update: async (id: string, updates: Partial<Student>): Promise<Student> => {
        await delay(400);
        const students = getStoredStudents();
        const idx = students.findIndex(s => s.id === id);
        if (idx === -1) throw new Error('Student not found');
        students[idx] = { ...students[idx], ...updates };
        saveStudents(students);
        return students[idx];
    },
    delete: async (id: string): Promise<void> => {
        await delay(300);
        const students = getStoredStudents().filter(s => s.id !== id);
        saveStudents(students);
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
        // role is already set to the correct UserRole enum value in mock data
        const students = mockStudents;
        const coaches  = mockCoaches;
        const admins   = mockAdmins;
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
        return [...attendanceStore];
    },
    getByStudent: async (studentId: string): Promise<AttendanceRecord[]> => {
        await delay(300);
        return attendanceStore.filter(a => a.studentId === studentId);
    },
    mark: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
        await delay(400);
        const existingIndex = attendanceStore.findIndex(
            a => a.bookingId === record.bookingId && a.studentId === record.studentId && a.date === record.date
        );
        const upsertedRecord: AttendanceRecord = existingIndex >= 0
            ? { ...attendanceStore[existingIndex], ...record }
            : { ...record, id: 'att' + Math.random().toString(36).substr(2, 6) };

        if (existingIndex >= 0) {
            attendanceStore[existingIndex] = upsertedRecord;
        } else {
            attendanceStore.push(upsertedRecord);
        }

        // Automatic make-up credit when student has medical absence.
        if (upsertedRecord.status === 'absent_medical') {
            const existingCreditIndex = recoveryStore.findIndex(
                c => c.sourceAttendanceId === upsertedRecord.id && c.studentId === upsertedRecord.studentId
            );
            const expiresAt = new Date(new Date(upsertedRecord.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            const credit: RecoveryCredit = {
                id: existingCreditIndex >= 0 ? recoveryStore[existingCreditIndex].id : 'rc' + Math.random().toString(36).substr(2, 6),
                studentId: upsertedRecord.studentId,
                sourceAttendanceId: upsertedRecord.id,
                status: 'active',
                expiresAt,
            };
            if (existingCreditIndex >= 0) {
                recoveryStore[existingCreditIndex] = credit;
            } else {
                recoveryStore.push(credit);
            }
            saveToStorage(RECOVERY_STORAGE_KEY, recoveryStore);
        }

        saveToStorage(ATTENDANCE_STORAGE_KEY, attendanceStore);
        console.log('Attendance marked:', upsertedRecord);
        return upsertedRecord;
    },
    confirm: async (recordId: string, coachId: string): Promise<AttendanceRecord> => {
        await delay(300);
        const index = attendanceStore.findIndex(a => a.id === recordId);
        if (index < 0) throw new Error('Attendance record not found');

        const updated: AttendanceRecord = {
            ...attendanceStore[index],
            confirmed: true,
            confirmedBy: coachId,
            confirmedAt: new Date().toISOString(),
        };
        attendanceStore[index] = updated;
        saveToStorage(ATTENDANCE_STORAGE_KEY, attendanceStore);
        console.log('Attendance confirmed:', updated);
        return updated;
    },
};

export const recoveryService = {
    getAll: async (): Promise<RecoveryCredit[]> => {
        await delay(200);
        return [...recoveryStore];
    },
    getByStudent: async (studentId: string): Promise<RecoveryCredit[]> => {
        await delay(200);
        return recoveryStore.filter(c => c.studentId === studentId);
    },
    consume: async (creditId: string, sessionId: string): Promise<RecoveryCredit> => {
        await delay(200);
        const index = recoveryStore.findIndex(c => c.id === creditId);
        if (index < 0) throw new Error('Recovery credit not found');
        const updated: RecoveryCredit = {
            ...recoveryStore[index],
            status: 'consumed',
            consumedSessionId: sessionId,
        };
        recoveryStore[index] = updated;
        saveToStorage(RECOVERY_STORAGE_KEY, recoveryStore);
        return updated;
    }
};

export const recoveryRequestService = {
    getAll: async (): Promise<RecoveryRequest[]> => {
        await delay(200);
        return [...recoveryRequestStore];
    },
    getByStudent: async (studentId: string): Promise<RecoveryRequest[]> => {
        await delay(200);
        return recoveryRequestStore.filter(r => r.studentId === studentId);
    },
    create: async (request: Omit<RecoveryRequest, 'id' | 'requestedAt' | 'status'>): Promise<RecoveryRequest> => {
        await delay(250);
        const existing = recoveryRequestStore.find(
            r => r.studentId === request.studentId && r.date === request.date && (r.status === 'pending' || r.status === 'confirmed')
        );
        if (existing) return existing;

        const created: RecoveryRequest = {
            id: 'rr' + Math.random().toString(36).substr(2, 6),
            studentId: request.studentId,
            date: request.date,
            status: 'pending',
            requestedAt: new Date().toISOString(),
        };
        recoveryRequestStore.push(created);
        saveToStorage(RECOVERY_REQUEST_STORAGE_KEY, recoveryRequestStore);
        return created;
    },
    confirm: async (requestId: string, coachId: string): Promise<RecoveryRequest> => {
        await delay(250);
        const index = recoveryRequestStore.findIndex(r => r.id === requestId);
        if (index < 0) throw new Error('Recovery request not found');
        const updated: RecoveryRequest = {
            ...recoveryRequestStore[index],
            status: 'confirmed',
            confirmedBy: coachId,
            confirmedAt: new Date().toISOString(),
        };
        recoveryRequestStore[index] = updated;
        saveToStorage(RECOVERY_REQUEST_STORAGE_KEY, recoveryRequestStore);
        return updated;
    },
};

export const healthService = {
    getAll: async (): Promise<StudentHealthFlag[]> => {
        await delay(150);
        return [...mockStudentHealthFlags];
    },
    getByStudent: async (studentId: string): Promise<StudentHealthFlag[]> => {
        await delay(150);
        return mockStudentHealthFlags.filter(f => f.studentId === studentId && f.isActive);
    },
};

export const progressService = {
    getLatestByStudent: async (studentId: string): Promise<ProgressSnapshot | undefined> => {
        await delay(150);
        return mockProgressSnapshots
            .filter(p => p.studentId === studentId)
            .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
    },
    getAllLatest: async (): Promise<ProgressSnapshot[]> => {
        await delay(150);
        const byStudent = new Map<string, ProgressSnapshot>();
        mockProgressSnapshots
            .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
            .forEach(snapshot => {
                if (!byStudent.has(snapshot.studentId)) {
                    byStudent.set(snapshot.studentId, snapshot);
                }
            });
        return Array.from(byStudent.values());
    },
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
