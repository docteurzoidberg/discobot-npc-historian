require('dotenv').config();

const fs = require('fs');

const databasePath = process.env.DATABASE_PATH || './data';

function uuid() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function loadUserDatabase(username) {

    const databaseFile = `${databasePath}/${username.toLowerCase()}.json`;
    if (!fs.existsSync(databaseFile)) {
        await saveUserDatabase(username, { achievements: [] });
    }

    const json = await fs.promises.readFile(databaseFile, 'utf8');
    let db = {};
    try {
        db = JSON.parse(json);
    } catch (error) {
        throw new Error(`Error parsing database file: ${error}`);
    }
    return db;
}

async function saveUserDatabase(username, db) {
    const databaseFile = `${databasePath}/${username.toLowerCase()}.json`;
    const newdb = {
        version: 1,
        lastUpdated: new Date(),
        achievements: [...db.achievements]
    };
    try {
        return await fs.promises.writeFile(databaseFile, JSON.stringify(newdb, null, 2));
    } catch (error) {
        throw new Error(`Error writing database file: ${error}`);
    }
}

async function getUserAchievementById(username, achievementid) {
    const db = await loadUserDatabase(username);
    return db.achievements.find(a => a.id.toLowerCase() === achievementid.toLowerCase());
}

async function getUserAchievements(username) {;
    const db = await loadUserDatabase(username);
    return db.achievements;
}

async function addUserAchievement(username, achievement) {
    
    //TODO: check achievement data
    
    const db = await loadUserDatabase(username);
    
    //check for duplicate id
    let newId = uuid();
    let needId = true;
    while(needId){
        let found = -1;
        db.achievements.forEach((element, index) => {
            if(element.id.toLowerCase() === newId.toLowerCase()) {
                found = index;
            }
        });
        if(found !== -1) {
            newId = uuid();
        } else {
            needId = false;
        }
    }

    const achievementBase = {
        id: newId,
        dateCreated: new Date()
    };

    const newAchievement = {...achievementBase, ...achievement};

    db.achievements.push(newAchievement);
    await saveUserDatabase(username, db);
}

async function updateUserAchievement(username, achievement) {

    const db = await loadUserDatabase(username);

    let found = -1;
    db.achievements.forEach((element, index) => {
        if(element.id.toLowerCase() === achievement.id.toLowerCase()) {
            found = index;
        }
    });
    if(found === -1) {
        throw new Error(`Error updating achievement: ${achievementid} not found`);
    }

    const achievementOveride = {
        dateUpdated:new Date()
    };

    const achievementUpdate = {...achievement, ...achievementOveride};

    //update database achievement
    db.achievements[found] = achievementUpdate;
    await saveUserDatabase(username, db);
}

async function completeUserAchievement(username, achievementid) {
    const db = await loadUserDatabase(username);
    let found = -1;
    db.achievements.forEach((element, index) => {
        if(element.id.toLowerCase() === achievementid.toLowerCase()) {
            found = index;
        }
    });
    if(found === -1) {
        throw new Error(`Error updating achievement: ${achievementid} not found`);
    }

    let achievement = db.achievements[found];
    achievement.dateCompleted = new Date();
    
    //update database achievement
    db.achievements[found] = achievement;
    await saveUserDatabase(username, db);
}

async function deleteUserAchievement(username, achievementid) {
    const db = await loadUserDatabase(username);
    let found = -1;
    db.achievements.forEach((element, index) => {
        if(element.id.toLowerCase() === achievementid.toLowerCase()) {
            found = index;
        }
    });
    if(found === -1) {
        throw new Error(`Error updating achievement: ${achievementid} not found`);
    }

    let achievement = db.achievements[found];
    achievement.dateDeleted = new Date();
    
    //update database achievement
    db.achievements[found] = achievement;
    await saveUserDatabase(username, db);
}

module.exports = {
    getUserAchievementById, getUserAchievements, addUserAchievement, updateUserAchievement, completeUserAchievement, deleteUserAchievement
};