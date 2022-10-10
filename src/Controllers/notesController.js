const knex = require('../Database/knex');

class NotesController{
  async create(request, response) {
    //Recuperando as informações passadas pelo corpo da requisição;
    const { title, description, rating, tags } = request.body;
    //Recuperando o user_id;
    const { user_id } = request.params;

    const note_id = await knex("notes").insert({
      title,
      description,
      rating,
      user_id
    });

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    });

    await knex("tags").insert(tagsInsert);

    return response.json();
  }

  async show(request, response) {
     const { id } = request.params;
     const note = await knex('notes').where( { id }).first();
     const tags = await knex('tags').where({ note_id: id }).orderBy('name');

     return response.json({
      ...note,
      tags
     })
  }

  async delete(request, response){
    const { id } = request.params;
    await knex('notes').where({ id }).delete()

    return response.json();
  }

  async index(request, response){
    const { user_id, title, tags } = request.query;
    
    let notes;
    
    //fazendo uma validação se existir alguma tag na nota, então o filtro vai ser baseado nas tags
    //senão vai ser uma filtragem normal
    if(tags){
      const filterTags = tags.split(',').map(tag => tag.trim());

      notes =await knex('tags')
      .select([
        'notes.id',
        'notes.title',
        'notes.user_id'
      ])
      .where('notes.user_id', user_id)
      .whereLike('notes.title',`%${title}%`)
      .whereIn('name', filterTags)
      .innerJoin('notes', 'notes.id', 'tags.note_id')

    }else{
      notes = await knex('notes')
      .where({ user_id })
      .whereLike('title', `%${title}%`)//Consigo fazer um filtro através de qualquer valor que exista dentro da string
      .orderBy('title');
    }

    const userTags = await knex('tags').where({ user_id });
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags
      }
    })
      
    return response.json(notesWithTags);
  }
}





module.exports = NotesController;