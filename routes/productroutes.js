const express = require("express");
const Product = require("../models/product");

const router = express.Router();

// CREATE PRODUCT
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// GET ALL PRODUCTS
// Filtering + Sorting + Pagination
router.get("/", async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sort = {};
    sort[sortBy] = sortOrder;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    const totalProducts = await Product.countDocuments(filter);

    res.json({
      totalProducts,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      products
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// LOW-STOCK ALERT REPORT
router.get("/reports/low-stock", async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;

    const products = await Product.find({
      quantity: { $lte: threshold }
    }).sort({ quantity: 1 });

    res.json({
      threshold,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// CATEGORY-WISE INVENTORY SUMMARY
router.get("/reports/category-summary", async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalInventoryValue: {
            $sum: {
              $multiply: ["$price", "$quantity"]
            }
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    res.json({
      message: "Category-wise inventory summary",
      summary
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// STOCK ADJUSTMENT
router.patch("/:id/stock", async (req, res) => {
  try {
    const { action, amount } = req.body;

    if (!["restock", "sale"].includes(action)) {
      return res.status(400).json({
        message: "Action must be restock or sale"
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (action === "restock") {
      product.quantity += Number(amount);
    }

    if (action === "sale") {
      if (product.quantity < Number(amount)) {
        return res.status(400).json({
          message: "Insufficient stock"
        });
      }

      product.quantity -= Number(amount);
    }

    await product.save();

    res.json({
      message: `Stock ${action} successful`,
      product
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;