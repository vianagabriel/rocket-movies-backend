const AppError = require('../Utils/AppError');
const sqliteConnection = require('../Database/sqlite');
const { hash, compare } = require('bcryptjs');

class UsersController {
   async create(request, response) {
      const { name, email, password } = request.body;
      const database = await sqliteConnection();//Criando a conexão com banco de dados.
      const checkUserExistis = await database.get('SELECT * FROM users WHERE email = (?)', [email]);
      
      //Checando se email passado já existe no banco de dados.
      if (checkUserExistis) {
         throw new AppError('Este e-mail já está em uso.');
      }
  
      //Criando constante para fazer a criptografia das senhas.
      const hashedPassword = await hash(password, 8);

      //Adicionando as informações recebidas pelo corpo da requisição no banco de dados.
      await database.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

      return response.status(201).json();
   }

   async update(request, response) {
      const { name, email, password, old_password } = request.body;
      const { id } = request.params;//Recuperando id passado na rota.
      const database = await sqliteConnection();
      const user = await database.get('SELECT * FROM users WHERE id = (?)',[id]);

      //Checando se o usuário não existe.
      if(!user){
         throw new AppError('Usuário não encontrado');
      }

      const userWithUpdatedEmail = await database.get('SELECT * FROM users WHERE email = (?)',[email]);

      //Checando se o email que o usuário está querendo mudar já não pertence a outro usuário.
      if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
         throw new AppError('Este e-mail já está em uso.')
      }

      //Se as informações passaram por todas as validações estão aqui está sendo atualizado o valor das variáveis.
      user.name = name ?? user.name;
      user.email = email ?? user.email;
  
      //Validando se a senha antiga foi informada.
      if(password && !old_password){
         throw new AppError('Você precisa informar a senha antiga para definir a nova!')
      }

      //Checando se a senha antiga é a mesma cadastrada no banco de dados.
      if(password && old_password){
         //Comparando as senhas.
         const checkOldPassword = await compare(old_password, user.password);
          
         //Se a senha antiga não conferir irá cair nessa validação.
         if(!checkOldPassword){
            throw new AppError('A senha antiga não confere.');
         }
         
         //Se as informações passaram por todas as validações então aqui vão ser atualizado os valores.
         user.password = await hash(password, 8);
      }

      //Aqui está sendo mandado para o banco de dados os valores já atualizados, assim concluindo a atualização.
      await database.run(`
        UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
        [user.name, user.email, user.password, id]
        );

        return response.json();
   }
};

module.exports = UsersController;



