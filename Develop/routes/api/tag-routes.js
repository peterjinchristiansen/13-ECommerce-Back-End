const router = require('express').Router();
const Model = require('../../models')

router.get('/', async (req, res) => {
    const getTags = await Model.Tag.findAll()
    const tags = getTags.map(tag => tag.dataValues)
    for(i = 0; i < tags.length; i++) {
        const getProductTags = await Model.ProductTag.findAll(
            { where: { tag_id: tags[i].id }}
        )
        const productTags = getProductTags.map(productTag => productTag.dataValues)
        let products = []
        for(j = 0; j < productTags.length; j++) {
            const getProduct = await Model.Product.findOne(
                { where: { id: productTags[j].product_id }}
            )
            products.push(getProduct.dataValues.product_name)
        }
        tags[i]['products'] = products
    }
    return res.json(tags)
});

router.get('/:id', async (req, res) => {
    const getTag = await Model.Tag.findOne(
        { where: { id: req.params.id }
    })
    const tag = getTag.dataValues
    const getProductTags = await Model.ProductTag.findAll(
        { where: { tag_id: tag.id }}
    )
    const productTags = getProductTags.map(productTag => productTag.dataValues)
    let products = []
    for(i = 0; i < productTags.length; i++) {
        const getProduct = await Model.Product.findOne(
            { where: { id: productTags[i].product_id }}
        )
        products.push(getProduct.dataValues.product_name)
    }
    tag['products'] = products
    return res.json(tag)
});

router.post('/', async (req, res) => {
    const { tag_name } = req.body
    try {
        await Model.Tag.create({
            tag_name
        })
        return res.json({ SUCCESS: 'Tag added to database' })  
    } catch (error) {
        return res.json({ ERROR: error.message })
    }
});

router.put('/:id', async (req, res) => {
    if(req.body.id) {
        return res.json({ ERROR: 'You cannot change the ID' })
    }
    if(!req.body.tag_name) {
        return res.json({ ERROR: 'Please input at least one valid column in your request' })
    }
    try {
        await Model.Tag.update(
            req.body,
            { where: { id: req.params.id }}
        )
        return res.json({ SUCCESS: 'Tag successfully updated' })  
    } catch (error) {
        return res.json({ ERROR: error.message })
    }
});

router.delete('/:id', async (req, res) => {
    await Model.Tag.destroy(
        { where: { id: req.params.id }}
    ).then(async () => {
        await Model.ProductTag.destroy(
            { where: { tag_id: req.params.id }}
        )
        return res.json({ SUCCESS: 'Tag successfully deleted' })  
    }).catch(error => {
        return res.json({ ERROR: error.message })
    })
});

module.exports = router;
