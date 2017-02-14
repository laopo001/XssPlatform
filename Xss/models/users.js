module.exports = function (db) {
    return db.define("users", {
        id: { type: 'serial', key: true },
        userName: { type: "text", size: 100 },
        password: { type: "text", size: 100 },
        email: { type: "text", size: 100 },
        isDeveloper: Number
    });
}