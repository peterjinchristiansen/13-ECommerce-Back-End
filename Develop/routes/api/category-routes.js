const router = require('express').Router();
const Model = require('../../models')

router.get('/', async (req, res) => {
    const getCategories = await Model.Category.findAll()
    const categories = getCategories.map(category => category.dataValues)
    for(i = 0; i < categories.length; i++) {
        const getProducts = await Model.Product.findAll(
            { where: { category_id: categories[i].id }}
        )
        const products = getProducts.map(product => product.dataValues.product_name)
        categories[i]['products'] = products
    }
    return res.json(categories)
});

router.get('/:id', async (req, res) => {
    const getCategory = await Model.Category.findOne(
        { where: { id: req.params.id }}
    )
    const category = getCategory.dataValues
    const getProducts = await Model.Product.findAll(
        { where: { category_id: req.params.id }}
    )
    const products = getProducts.map(product => product.dataValues.product_name)
    category['products'] = products
    return res.json(category)
});

router.post('/', async (req, res) => {
    const { category_name } = req.body
    try {
        await Model.Category.create({
            category_name
        })
        return res.json({ SUCCESS: 'Category added to database' })  
    } catch (error) {
        return res.json({ ERROR: error.message })
    }
});

router.put('/:id', async (req, res) => {
    if(req.body.id) {
        return res.json({ ERROR: 'You cannot change the ID' })
    }
    if(!req.body.category_name) {
        return res.json({ ERROR: 'Please input at least one valid column in your request' })
    }
    try {
        await Model.Category.update(
            req.body,
            { where: { id: req.params.id }}
        )
        return res.json({ SUCCESS: 'Category successfully updated' })  
    } catch (error) {
        return res.json({ ERROR: error.message })
    }
});

router.delete('/:id', async (req, res) => {
    const findCategory = await Model.Category.findOne(
        { where: { id: req.params.id }}
    )
    if(!findCategory) {
        return res.json({ ERROR: 'Category does not exist' })
    }
    try {
        await Model.Category.destroy(
            { where: { id: req.params.id }}
        )
        return res.json({ SUCCESS: 'Category successfully deleted' })  
    } catch (error) {
        return res.json({ ERROR: error.message })
    }
});

module.exports = router;
