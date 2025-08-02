// import React from 'react'
// import { Button } from '../ui/button'
// import { IQuizBuilderStages } from '@/types/types'

// const AdminQuestionCard = ({setStep}: {setStep: (step: IQuizBuilderStages) => void) => {
//     return (
//         <div className='p-2 flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-input rounded-sm'>
//             <div className='flex justify-between'>
//                 <span className='font-medium'>Question 1</span>
//             </div>
//             <p className='text-2xl font-semibold text-foreground/90 border border-input rounded-sm p-4 h-22 flex items-center'>
//                 'What would you like to ask?'
//             </p>
//             {question.options.map((option, i) => {
//                 const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0

//                 return (
//                     <div key={i} className='flex flex-col gap-1.5 w-full border border-input p-4 rounded-sm'>
//                         <div className='flex justify-between text-sm text-foreground/80'>
//                             <span className='text-base truncate max-w-[70%]' title={option.text}>{option.text}</span>
//                             <span>{option.voteCount} votes • {Math.round(percentage)}%</span>
//                         </div>
//                         <div className='relative w-full h-3 bg-secondary rounded-sm overflow-hidden'>
//                             <div
//                                 className='absolute top-0 left-0 h-full bg-primary rounded-sm transition-all duration-300'
//                                 style={{ width: `${percentage}%` }}
//                                 role="progressbar"
//                                 aria-valuenow={percentage}
//                                 aria-valuemin={0}
//                                 aria-valuemax={100}
//                             />
//                         </div>
//                     </div>
//                 )
//             })}

//             <div className='flex gap-2 mt-4'>
//                 <Button
//                     variant={"default"}
//                     className='px-4 py-2 rounded-sm disabled:opacity-50'
//                 >
//                     Next Question
//                 </Button>
//             </div>

//         </div>
//     )
// }

// export default AdminQuestionCard

import { IQuizBuilderStages } from '@/types/types'
import React from 'react'

const AdminQuestionCard = ({setStep}: {setStep: (step: IQuizBuilderStages) => void}) => {
  return (
    <div>AdminQuestionCard</div>
  )
}

export default AdminQuestionCard