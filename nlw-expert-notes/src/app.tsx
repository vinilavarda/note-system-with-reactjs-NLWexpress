import { ChangeEvent, useState } from 'react'
import logo from './assets/logo-nlw-expert.svg'
import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'
import { Toaster, toast } from 'sonner'


interface Note {
  id: string,
  date: Date,
  content: string
}

export function App() {

  const [search, setSearch] = useState('');

  const [notes, setNotes] = useState<Note[]>(() => {
    
    const notesOnStorage = localStorage.getItem('notesCookies');

    if (notesOnStorage) {
      return JSON.parse(notesOnStorage);  // recupera os valores da localStorage pra inicializar o array notes
    }

    return [];
  });

  function onNoteCreated(content: string) {
    const newNote = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
    }

    const arrayNotes = [newNote, ...notes];

    setNotes(arrayNotes);

    localStorage.setItem('notesCookies', JSON.stringify(arrayNotes));
  }

  function onNoteDeleted(id: string) {
    const arrayNotes = notes.filter(note => {
      return note.id !== id;
    });

    toast.success('Nota deletada com sucesso!');
    setNotes(arrayNotes);
    localStorage.setItem('notesCookies', JSON.stringify(arrayNotes));

  }

  // function com objetivo te pegar o valor que vai ser escrito na barra de pesquisa e settar na variavel search
  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;

    setSearch(query);
  }


  // verifica se search tem valor. Se tiver, filteredNotes vai receber as notes que incluam o q ta escrito em search, se nao vai receber tudo
  const filteredNotes = search !== '' ? notes.filter(note => note.content.toLowerCase().includes(search)) : notes;


  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <img src={logo} />


      <form className="w-full">
        <input
          type="text"
          placeholder="Busque em suas notas..."
          className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-state-500"
          onChange={handleSearch}
        />
      </form>

      <div className="h-px bg-slate-700" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        

        {/* o parametro onNoteCreated foi criado e passado para que essa function onNoteCreated fosse possivel de ser utilizada no outro component */}
        <NewNoteCard onNoteCreated={ onNoteCreated }/>

        { //percore filteredNotes pra mostrar as infos na tela
          filteredNotes.map(note => {
            return <NoteCard key={note.id} note = {note} onNoteDeleted={onNoteDeleted}/> //map para percorrer a variavel. Note em verde é a propriedade obrigatoria criada no card. Note branco é parametro do map.

          })
        }
      </div>
    </div>
  )
}


