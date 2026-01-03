const asyncHandler = (reqHandler) => {
  //return key word required 
    return (req, res, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch((error) => next(error));
  };
};

module.exports = { asyncHandler };


// comments =  what are higher order function in js . promise is is higher ordefr or not ?

// const asyncHandler = () => {}
// const asyncHandler = (fn)=> async () => {}
// const asyncHandler = (func) => {()=>{}}

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//   } catch (err) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
