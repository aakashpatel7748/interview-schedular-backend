import nodemailer from "nodemailer"
import ErrorHandler from "./ErrorHandler.js"

export const sendMail = async (req, res, next, url) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "apatel7748@gmail.com",
            pass: "odyz igwp aghw sjsr"
        }
    })

    const mailoption = {
        from: " Aakash Patel Send Mail",
        to: req.body.email,
        subject: "Password Forget Link",
        // text:"Do not  share this link to anyone"
        html: `<p>Do not  share this link to anyone</p>
        <h1>click link blow  to reset link</h1>
        <a href=${url}>Reset Password</a>`
    }

    transport.sendMail(mailoption, (err, info) => {
        if (err) return next(new ErrorHandler(err, 500));
        return res.status(200).json({
            message: "Email sent successfully",
            url
        })
    })
}
