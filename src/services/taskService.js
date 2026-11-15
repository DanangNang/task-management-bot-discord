const prisma = require('../database/prisma');

/**
 * Membuat Task Baru beserta relasi anggotanya
 */
async function createTask({ guildId, name, startAt, deadline, createdBy, memberIds = [] }) {
    return await prisma.task.create({
        data: {
            guildId,
            name,
            startAt: new Date(startAt),
            deadline: new Date(deadline),
            createdBy,
            members: {
                create: memberIds.map(userId => ({
                    discordUserId: userId,
                })),
            },
        },
        include: {
            members: true,
        },
    });
}

/**
 * Mengambil daftar task aktif dalam satu server
 */
async function getActiveTasks(guildId) {
    return await prisma.task.findMany({
        where: {
            guildId,
            status: 'ACTIVE',
        },
        include: {
            members: true,
        },
        orderBy: {
            deadline: 'asc',
        },
    });
}

/**
 * Mengambil task berdasarkan ID
 */
async function getTaskById(taskId) {
    return await prisma.task.findUnique({
        where: { id: Number(taskId) },
        include: {
            members: true,
        },
    });
}

/**
 * Memperbarui data task
 */
async function updateTask(taskId, { name, startAt, deadline, memberIds }) {
    const updateData = {};
    if (name) updateData.name = name;
    if (startAt) updateData.startAt = new Date(startAt);
    if (deadline) updateData.deadline = new Date(deadline);

    if (memberIds && Array.isArray(memberIds)) {
        // Hapus member lama lalu buat ulang
        await prisma.taskMember.deleteMany({
            where: { taskId: Number(taskId) },
        });

        updateData.members = {
            create: memberIds.map(userId => ({
                discordUserId: userId,
            })),
        };
    }

    return await prisma.task.update({
        where: { id: Number(taskId) },
        data: updateData,
        include: {
            members: true,
        },
    });
}

/**
 * Menandai task sebagai SELESAI (COMPLETED)
 */
async function completeTask(taskId) {
    return await prisma.task.update({
        where: { id: Number(taskId) },
        data: { status: 'COMPLETED' },
    });
}

/**
 * Menandai task sebagai DELETED (Soft Delete)
 */
async function deleteTask(taskId) {
    return await prisma.task.update({
        where: { id: Number(taskId) },
        data: { status: 'DELETED' },
    });
}

/**
 * Menandai task sebagai EXPIRED (Kadaluwarsa)
 */
async function markTaskExpired(taskId) {
    return await prisma.task.update({
        where: { id: Number(taskId) },
        data: { status: 'EXPIRED' },
    });
}

/**
 * Mengambil seluruh task (aktif, terlewat/selesai, dan dihapus) dalam satu server
 */
async function getAllTasks(guildId) {
    return await prisma.task.findMany({
        where: { guildId },
        include: {
            members: true,
        },
        orderBy: {
            id: 'desc',
        },
    });
}

/**
 * Menghapus permanen seluruh task berstatus DELETED pada server tertentu,
 * lalu mengurutkan ulang ID task yang tersisa mulai dari 1 (beserta relasi TaskMember).
 */
async function clearDeletedTasks(guildId) {
    return await prisma.$transaction(async (tx) => {
        // 1. Hitung jumlah task berstatus DELETED yang akan dihapus
        const deletedCount = await tx.task.count({
            where: {
                guildId,
                status: 'DELETED',
            },
        });

        if (deletedCount === 0) {
            return { deletedCount: 0, remainingCount: 0 };
        }

        // 2. Hapus semua task berstatus DELETED (TaskMember terkait ikut terhapus karena onDelete: Cascade)
        await tx.task.deleteMany({
            where: {
                guildId,
                status: 'DELETED',
            },
        });

        // 3. Ambil seluruh task yang tersisa di database (diurutkan berdasarkan ID lama)
        const remainingTasks = await tx.task.findMany({
            include: { members: true },
            orderBy: { id: 'asc' },
        });

        // 4. Hapus sementara tabel Task & reset auto-increment SQLite agar ID kembali dari 1
        await tx.taskMember.deleteMany({});
        await tx.task.deleteMany({});
        await tx.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name IN ('Task', 'TaskMember');`);

        // 5. Masukkan kembali seluruh task yang tersisa dengan urutan ID baru (1, 2, 3, ...)
        for (const oldTask of remainingTasks) {
            await tx.task.create({
                data: {
                    guildId: oldTask.guildId,
                    name: oldTask.name,
                    startAt: oldTask.startAt,
                    deadline: oldTask.deadline,
                    status: oldTask.status,
                    createdBy: oldTask.createdBy,
                    createdAt: oldTask.createdAt,
                    members: {
                        create: oldTask.members.map(m => ({
                            discordUserId: m.discordUserId,
                        })),
                    },
                },
            });
        }

        return {
            deletedCount,
            remainingCount: remainingTasks.length,
        };
    });
}

module.exports = {
    createTask,
    getActiveTasks,
    getTaskById,
    updateTask,
    completeTask,
    deleteTask,
    markTaskExpired,
    getAllTasks,
    clearDeletedTasks,
};