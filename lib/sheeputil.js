function findAvailableSheep(bot)
{
    function isInRange(l, x, r)
    {
        return l<=x && x<=r
    }
    function dist(entity)
    {
        return Math.abs(bot.entity.position.x - entity.position.x) 
            +  Math.abs(bot.entity.position.z - entity.position.z)
    }
    var total = 0;
    var not_sheared = 0;

    var target = null;
    for (var key in bot.entities)
    {
        if (bot.entities[key].mobType !== "Sheep")
            continue

        if (!isInRange(SheepMinX, bot.entities[key].position.x, SheepMaxX))
            continue
        if (!isInRange(SheepMinZ, bot.entities[key].position.z, SheepMaxZ))
            continue
        if (bot.entities[key].position.y != ItemExpectedY)
            continue
        total++;

        // Adapted for 1.8, change 13 to 16 in 1.9+?
        // 13 is for 1.12
        var sheep_info
        if (bot.version === "1.8")
            sheep_info = bot.entities[key].metadata[13]
        else
            sheep_info = bot.entities[key].metadata[16]

        if (sheep_info & 16) // Sheared
            continue
        not_sheared++;

        // Unwanted color
        var match = (1 << (sheep_info & 0xF)) & global.WoolMask
        if (!match)
            continue

        if (!target)
            target = bot.entities[key]
        else if (dist(bot.entities[key]) < dist(target))
            target = bot.entities[key]
    }
    console.log(total, "sheeps,", not_sheared, "shearable")
    //console.log(target.metadata)
    return target
}

function findDroppedWool(bot)
{
    function isInRange(l, x, r)
    {
        return l<=x && x<=r
    }
    for (var key in bot.entities)
    {
        if (bot.entities[key].objectType !== "Dropped item") // in 1.8
            continue
        if (!bot.entities[key].metadata[10]) // Object metadata in 1.8
            continue
        if (bot.entities[key].metadata[10].blockId !== 35) // Wool in 1.8
            continue

        if (!isInRange(SheepMinX, bot.entities[key].position.x, SheepMaxX))
            continue
        if (!isInRange(SheepMinZ, bot.entities[key].position.z, SheepMaxZ))
            continue
        if (bot.entities[key].position.y != ItemExpectedY)
            continue
        return bot.entities[key]
    }
    return null
}

module.exports = {
    findAvailableSheep,
    findDroppedWool
}
