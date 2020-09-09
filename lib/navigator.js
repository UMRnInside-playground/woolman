function goToWork(point, action, onerror)
{
    var result = bot.navigate.findPathSync(point)
    // console.log(result)
    //if (result.status === "success")
    if (result.status)
    {
        // bot.navigate.walk(result.path, action)
        bot.navigate.walk(result.path, (reason) => {
            console.log(result.status, reason);action()})
    }
    else
    {
        console.log(result)
        if (onerror)
            onerror()
    }
}

module.exports = {
    goToWork
}
