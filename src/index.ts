import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

//REFATORANDO NOSSO CODIGO COM TRY E CATCH

app.get("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const result = accounts.find((account) => account.id === id)
        if (!result) {
            res.status(404)
            throw new Error("Conta não encontrada. Verifique a 'id' ")
        }
        res.status(200).send(result)
    } catch (err) {
        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(err.message)
    }
})

app.delete("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
        //IRÁ VERIFICAR SE O ID COMEÇA COM A
        if (id[0] !== 'a') {
            res.status(400)
            throw new Error("'id' inválido. Deve iniciar com a letra 'a'")
        }
        const accountIndex = accounts.findIndex((account) => account.id === id)

        // ORIGINALMENTE ERA ASSIM
        // if (accountIndex >= 0) {
        //     accounts.splice(accountIndex, 1)
        // }
        // res.status(200).send("Item deletado com sucesso")

        //DEPOIS FICOU ASSIM
        // if (accountIndex >= 0) {
        //     accounts.splice(accountIndex, 1)
        //     res.status(200).send("Item deletado com sucesso")
        // }

        //FINALMENTE FICOU ASSIM
        if (accountIndex < 0) {
            res.status(404)
            throw new Error("Conta não encontrada. Verifique o 'id'")
        } else {
            accounts.splice(accountIndex, 1)
            res.status(200).send("Item deletado com sucesso")
        }


    } catch (err) {
        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(err.message)
    }
})

app.put("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const newId = req.body.id as string | undefined
        const newOwnerName = req.body.ownerName as string | undefined
        const newBalance = req.body.balance as number | undefined
        const newType = req.body.type as ACCOUNT_TYPE | undefined

        //AVISOS DE ERROS DO BALANCE
        if(newBalance !== undefined){
            if(typeof newBalance !== "number"){
                res.status(400)
                throw new Error("Balance deve ser um número")
            }
            if(newBalance <= 0){
                res.status(400)
                throw new Error("Balance deve ser maior ou igual a zero")
            }
        }

        //AVISO DE QUE O TYPE TEM QUE SER UM DOS ENUM
        if(newType !== undefined){
            if(newType !== "Ouro" && newType !== "Platina" && newType !== "Black"){
                res.status(400)
                throw new Error("Type deve ser uma categoria válida")
            }
        }

        //AVISO SE O ID INSERIDO N COMEÇAR COM A e se é uma string
        if(newId !== undefined){
            if(typeof newId !== "string"){
                res.status(400)
                throw new Error("O id deve ser uma string")
            }
            if(newId[0] !== 'a'){
                res.status(400)
                throw new Error("'id' inválido. Deve iniciar com a letra 'a'")
            }
        }

        //AVISO DE QUE TEM QUE TER NO MINIMO 2 CARACTERES
        if(newOwnerName !== undefined){
            if(newOwnerName.length < 2){
                res.status(400)
                throw new Error("Insira um nome de usuário com mais de 2 caracteres")
            }
        }

        const account = accounts.find((account) => account.id === id)

        if (account) {
            account.id = newId || account.id
            account.ownerName = newOwnerName || account.ownerName
            account.type = newType || account.type

            account.balance = isNaN(newBalance) ? account.balance : newBalance
        }
        res.status(200).send("Atualização realizada com sucesso")
    } catch (err) {
        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(err.message)
    }
})

