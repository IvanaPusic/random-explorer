import React from 'react';

const LanguageModal = ({ setIsLanguageModalOpen, languages, language, setLanguage  }) => {

  const handleSubmit = e => {
    e.preventDefault();
    localStorage.setItem('language', language)
    if(language === null) {
      alert('Please select a language')
    } else if(language !== null) {
      setIsLanguageModalOpen(false)
    } 
  }
  const closeModal = () => {
    localStorage.setItem('language', languages[26].language)
    setIsLanguageModalOpen(false);
  }

  return (
    <div className='fixed top-0 left-0 w-screen h-screen z-20 bg-primary  flex justify-center align-middle'>
         <button className='absolute top-6 right-12' onClick={closeModal}>
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#121212" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      <div className='p-40 bg-primary my-auto relative rounded-lg w-screen h-[75vh]'>
        <div className='flex flex-col gap-4'> 
           <h4 className='text-dark font-semibold md:text-lg lg:text-2xl'>Please select a language: </h4>
         <form className='flex flex-col justify-start align-baseline'>
          <select name="languages" id="languages" value = {language} onChange={e => setLanguage(e.target.value)} className='outline-none cursor-pointer border-2 border-accentDark py-4 px-2 rounded-md'>
            {
              languages.map(singleLanguage => {
                const {id, language} = singleLanguage;
                return <option key = {id} value={language} className='text-dark'>{language}</option>
              })
            }
          </select>
        </form>
        </div>
          <button onClick = {handleSubmit} className='md:text-lg lg:text-2xl absolute bottom-6 right-12 text-dark bg-accentDark font-semibold py-2 px-6 rounded-lg transition-all ease-linear hover:font-semibold hover:translate-x-1  hover:scale-1 '>Next</button>
      </div>
    </div>
  )
}

export default LanguageModal