import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Toaster, toast } from 'sonner'

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {

    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    function handleStartEditor() {
        setShouldShowOnboarding(false);
    }

    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {

        setContent(event.target.value); //atribui a content o valor digitado na textarea

        if (event.target.value === '') {
            setShouldShowOnboarding(true); 
        }

    }
    
    function handleCloseOnboarding() {
        if (speechRecognition) {
            speechRecognition.stop()
        }
        setShouldShowOnboarding(true);
        setIsRecording(false);
        setContent('');
        setIsRecording(false);

    }

    function handleSaveNote(event: FormEvent) {

        event.preventDefault(); // impede de atualizar a pagina após submit do formulario (evento padrao do form é atualizar pagina)

        //caso texto vazio, nao salva
        if (content === '') {
            toast.error('É necessário criar um texto!');
        } else {
            onNoteCreated(content);
            toast.success('Nota salva com sucesso!')
            setContent('');
            handleCloseOnboarding();
        }
    }

    function handleStartRecording() {

        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

        if(!isSpeechRecognitionAPIAvailable) {
            toast.info('Infelizmente seu navegador não suporta a API de gravação!');
            return;
        }

        setIsRecording(true);
        setShouldShowOnboarding(false);

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        speechRecognition = new SpeechRecognitionAPI();

        speechRecognition.lang              = 'pt-BR'
        speechRecognition.continuous        = true;     // so vai parar de gravar quando mandado. Se false, para de gravar quando para de ouvir voz
        speechRecognition.maxAlternatives   = 1;       //  escolhe a melhor opção q a api acha q é q foi dito
        speechRecognition.interimResults    = true;   //   vai escrevendo ao mesmo tempo q tu vai falando, se false ele espera tu falar tudo

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript);
            }, '')

            setContent(transcription);
        }
        
        speechRecognition.onerror = (error) => {
            console.error(error);
        }

        speechRecognition.start();


    }

    function handleStopRecording() {

        if (speechRecognition) {
            speechRecognition.stop()
        }

        setIsRecording(false);

    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className="rounded-md text-left flex flex-col bg-slate-700 p-5 gap-3 overflow-hidden hover:ring-2 outline-none hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
                <span className="text-sm font-medium text-slate-500">Adicionar Nota</span>
                <p className="text-sm leading-6 text-slate-400">Grave uma nota em áudio que será convertida para texto automaticamente.</p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/50" />
                <Dialog.Content className="fixed overflow-hidden inset-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none" >

                    <Dialog.Close onClick={handleCloseOnboarding} className='absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
                        <X className='size-5' />
                    </Dialog.Close>

                    <form className='flex flex-col flex-1'>
                        <div className='flex flex-1 flex-col gap-3 p-5'>
                            <span className="text-sm font-medium text-slate-300"> Adicionar nota </span>

                            {
                                shouldShowOnboarding ? (
                                    <p className="text-sm leading-6 text-slate-400"> Comece <button type="button" onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota</button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'> utilize apenas texto</button>. </p>
                                ) : (
                                    <textarea id='sss' onChange={handleContentChanged} value={content} autoFocus className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'></textarea>
                                )
                            }
                        </div>

                        {isRecording ? (
                            <button type='button' onClick={handleStopRecording} className='w-full flex items-center justify-center gap-3 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100'> 
                                
                                <div className='size-4 rounded-full bg-red-500 animate-pulse'></div>
                                Gravando! ( Clique p/ interromper )
                            </button>
                        ) : (
                            <button type='button' onClick={handleSaveNote} className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'> 
                                Salvar nota
                            </button>
                        )}

                    </form>
                </Dialog.Content>
            </Dialog.Portal>

        </Dialog.Root>
    )
}