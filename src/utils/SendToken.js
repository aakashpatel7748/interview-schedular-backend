export const sendToken = async (user, statusCode, res) => {
    const token = await user.getJwtToken();
    // Options for cookie
    const cookieExpire = Number(process.env.COOKIE_EXPIRE) || 1;

    const options = {
        expires: new Date(Date.now() + cookieExpire* 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    const responseData = { success: true, token };

    res
        .status(statusCode)
        .cookie("token", token, options)
        .json(responseData)
}

