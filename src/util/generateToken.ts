import jwt from 'jsonwebtoken'

export const generateToken = async (id:number, JwtPayload:string) => {
    const token = jwt.sign({ id }, JwtPayload, {
        expiresIn: "30d",
    });
    return `Bearer ${token}`;
}
