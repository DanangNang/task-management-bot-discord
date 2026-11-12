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

module.exports = {
    createTask,
    getActiveTasks,
    getTaskById,
    updateTask,
    completeTask,
    deleteTask,
    markTaskExpired,
};