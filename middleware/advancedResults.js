const advancedResults = (model,populate) => async(req,res,next) => {
    let query;
    // const req.query
    const reqQuery = {...req.query};

    //Fields to be removed
    const removeFields = ['select','sort','page','limit']

    // Loop over removeFields and delete them from the reqQuery

    removeFields.forEach(param => delete reqQuery[param])

    //create a query string
    let queryStr = JSON.stringify(reqQuery);

    //create operators ($gt,$gte)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    //Finding resources
    query =  model.find(JSON.parse(queryStr));
    console.log(model)

    // Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query.select(fields);

    }

    //sort 
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt')
    }

    //Pagination

    const page = parseInt(req.query.page,10) || 10;
    const limit = parseInt(req.query.limit,10) || 10;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const total = await model.countDocuments();


//       query = query.skip(startIndex).limit(limit);

    if(populate){
        query =  query.populate(populate);
    }

    //Executing query
    const results = await query;
    //Pagination result 
    const pagination = {};
    if(endIndex < total){
        pagination.next ={
            page:page+1,
            limit
        }

    }

    if(startIndex>0){
        pagination.prev = {
            page:page-1,
            limit
        }
    }

    res.advancedResults = {
        success:true,
        count:results.length,
        pagination,
        data:results
    }
    next();
    console.log(res.advancedResults)

}

module.exports = advancedResults;