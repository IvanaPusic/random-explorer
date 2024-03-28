import React from 'react';
import close from '../assets/close.svg';

const ChangeCategoriesModal = ({ language, getLandmarks, setIsUpdateCategories, updatedCategories, setUpdatedCategories, allCategories }) => {
const handleChange = e => {
    const checkboxValue = e.target.value;
		if (updatedCategories.includes(checkboxValue)) {
			// Remove checkbox value if already selected
			setUpdatedCategories(updatedCategories.filter(item => item !== checkboxValue));
		} else {
			// Add checkbox value if not selected
			setUpdatedCategories([...updatedCategories, checkboxValue]);
		}
  }
  const handleSubmit = e => {
    e.preventDefault();
    if(updatedCategories.length === 0) {
      alert('Please select landmarks')
    } 
    localStorage.setItem('categories', updatedCategories);
    if(language && localStorage.getItem('categories')) {
      getLandmarks()
      setIsUpdateCategories(false);
    }
  }


 const closeModal = () => {
  setIsUpdateCategories(false);
 }

  return (
     <div className='fixed top-0 left-0 w-screen h-screen z-10 bg-primary flex justify-center align-middle'>
       <button className='absolute top-6 right-6' onClick ={closeModal}>
          <img src={close} alt="close-btn" />
        </button>
      <div className='p-12 py-40 md:p-40 bg-primary my-auto relative rounded-lg w-screen h-[75vh]'>
        <div className='flex flex-col gap-4 md:justify-center md:align-middle md:p-20 xl-p-40'> 
           <h4 className='text-dark font-semibold md:text-lg lg:text-2xl'>Change landmark categories: </h4>
            <form className='flex gap-4 flex-col align-center pt-4 '>
              {
                allCategories.map(singleCategory => {
                  const {id, category} = singleCategory;
                  return <div key = {id}>
                    <input type="checkbox" name={category} id={category} value={category} onChange={handleChange}/>
                    <h5 className='ml-1 text-md inline-block md:text-lg lg:text-2xl'>{category}</h5>
                  </div>
                })
              }
            </form>
        </div>
            <button onClick = {handleSubmit} className='md:text-lg lg:text-2xl absolute bottom-6 right-12 text-dark bg-accentDark font-semibold py-2 px-6 rounded-lg transition-all ease-linear hover:font-semibold hover:translate-x-1  hover:scale-1 '>Done</button>
      </div>
    </div>
  )
}

export default ChangeCategoriesModal