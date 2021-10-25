const router = require('express').Router();
const Model = require('../../models')

router.get('/', async (req, res) => {
    const getProducts = await Model.Product.findAll()
    const products = getProducts.map(product => product.dataValues)
    for(i = 0; i < products.length; i++) {
        const getCategory = await Model.Category.findOne(
            { where: { id: products[i].category_id }}
        )
        const category = getCategory.dataValues.category_name
        const getProductTags = await Model.ProductTag.findAll(
            { where: { product_id: products[i].id }}
        )
        const productTags = getProductTags.map(productTag => productTag.dataValues)
        let tags = []
        for (j = 0; j < productTags.length; j++) {
            const getTag = await Model.Tag.findOne(
                { where: { id: productTags[j].tag_id }}
            )
            const tag = getTag.dataValues.tag_name
            tags.push(tag)
        }
        products[i]['category'] = category
        products[i]['tags'] = tags
    }
    return res.json(products)
});

router.get('/:id', async (req, res) => {
    const getProduct = await Model.Product.findOne(
        { where: { id: req.params.id }}
    )
    const product = getProduct.dataValues
    const getCategory = await Model.Category.findOne(
        { where: { id: product.category_id }}
    )
    const category = getCategory.dataValues.category_name
    const getProductTags = await Model.ProductTag.findAll(
        { where: { product_id: product.id }}
    )
    const productTags = getProductTags.map(productTag => productTag.dataValues)
    let tags = []
    for (i = 0; i < productTags.length; i++) {
        const getTag = await Model.Tag.findOne(
            { where: { id: productTags[i].tag_id }}
        )
        const tag = getTag.dataValues.tag_name
        tags.push(tag)
    }
    product['category'] = category
    product['tags'] = tags
    return res.json(product)
})

router.post('/', async (req, res) => {
    const { product_name, price, stock, category_name, tags } = req.body
    const getCategory = await Model.Category.findOne(
        { where: { category_name: category_name }}
    )
    if(!getCategory) {
        return res.json({ ERROR: 'Category name does not exist' })
    }
    const category_id = getCategory.dataValues.id

    await Model.Product.create({
        product_name,
        price,
        stock,
        category_id
    }).then(async response => {
        if(tags.length) {
            for (i = 0; i < tags.length; i++) {
                const [tag] = await Model.Tag.findOrCreate(
                    { where: { tag_name: tags[i] }}
                )
                await Model.ProductTag.create({
                    product_id: response.dataValues.id,
                    tag_id: tag.dataValues.id
                })
            }

        }
        return res.json({ SUCCESS: 'Product added to database' })
    }).catch(error => {
        return res.json({ ERROR: error.message })
    })
});

router.put('/:id', async (req, res) => {
    const { product_name, price, stock, category_name, category_id, tags } = req.body
    if(req.body.id) {
        return res.json({ ERROR: 'You cannot change the ID' })
    }
    if(!product_name && !price && !stock && !category_name && !category_id && !tags) {
        return res.json({ ERROR: 'Please input at least one valid column in your request' })
    }
    if(category_name) {
        const findCategory = await Model.Category.findOne(
            { where: { category_name: category_name }}
        )
        if(!findCategory) {
            return res.json({ ERROR: 'Category name does not exist' })
        }
        req.body.category_id = findCategory.dataValues.id
    }

    await Model.Product.update(
        req.body,
        { where: { id: req.params.id }}
    ).then(async () => {
        if(tags.length) {
            for (i = 0; i < tags.length; i++) {
                const [tag] = await Model.Tag.findOrCreate(
                    { where: { tag_name: tags[i] }}
                )
                await Model.ProductTag.create({
                    product_id: req.params.id,
                    tag_id: tag.dataValues.id
                })
            }
        }
        return res.json({ SUCCESS: 'Product successfully updated' })
    }).catch(error => {
        return res.json({ ERROR: error.message })
    })
})

router.delete('/:id', async (req, res) => {
    await Model.Product.destroy(
        { where: { id: req.params.id }}
    ).then(async () => {
        await Model.ProductTag.destroy(
            { where: { product_id: req.params.id }}
        )
        return res.json({ SUCCESS: 'Product successfully deleted' })
    }).catch(error => {
        return res.json({ ERROR: error.message })
    })
});

module.exports = router;
