import Car from "../models/car.js";
import Auction from "../models/auction.js";

// ==========================================
// CREATE CAR
// ==========================================

export const createCar = async (req, res) => {
  try {
    const {
      title,
      brand,
      model,
      year,
      mileage,
      fuelType,
      transmission,
      description,
      location,
      images
    } = req.body;

    // Check required fields
    if (
      !title ||
      !brand ||
      !model ||
      !year ||
      mileage === undefined ||
      !fuelType ||
      !transmission ||
      !description ||
      !location
    ) {
      return res.status(400).json({
        message: "Please provide all required car information"
      });
    }

    // Create car
    const car = await Car.create({
      title,
      brand,
      model,
      year,
      mileage,
      fuelType,
      transmission,
      description,
      location,
      images: images || [],
      seller: req.user.userId
    });

    res.status(201).json({
      message: "Car created successfully",
      car
    });

  } catch (error) {
    console.error("Create car error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ==========================================
// GET ALL CARS
// SEARCH + FILTERS + AUCTION FILTERS + PAGINATION
// ==========================================

export const getCars = async (req, res) => {
  try {
    const {
      search,
      brand,
      fuelType,
      transmission,
      location,

      // Car filters
      minYear,
      maxYear,
      minMileage,
      maxMileage,

      // Auction filters
      minPrice,
      maxPrice,
      auctionStatus,

      // Pagination
      page = 1,
      limit = 10,

      // Sorting
      sort = "newest"
    } = req.query;


    // ==========================================
    // 1. CAR FILTERS
    // ==========================================

    const carFilter = {};


    // Search in title, brand and model
    if (search) {
      carFilter.$or = [
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          brand: {
            $regex: search,
            $options: "i"
          }
        },
        {
          model: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }


    // Brand
    if (brand) {
      carFilter.brand = {
        $regex: `^${brand}$`,
        $options: "i"
      };
    }


    // Fuel type
    if (fuelType) {
      carFilter.fuelType = fuelType;
    }


    // Transmission
    if (transmission) {
      carFilter.transmission = transmission;
    }


    // Location
    if (location) {
      carFilter.location = {
        $regex: location,
        $options: "i"
      };
    }


    // Year
    if (minYear || maxYear) {
      carFilter.year = {};

      if (minYear) {
        carFilter.year.$gte = Number(minYear);
      }

      if (maxYear) {
        carFilter.year.$lte = Number(maxYear);
      }
    }


    // Mileage
    if (minMileage || maxMileage) {
      carFilter.mileage = {};

      if (minMileage) {
        carFilter.mileage.$gte = Number(minMileage);
      }

      if (maxMileage) {
        carFilter.mileage.$lte = Number(maxMileage);
      }
    }


    // ==========================================
    // 2. AUCTION FILTERS
    // ==========================================

    const auctionFilter = {};


    // Current auction price
    if (minPrice || maxPrice) {
      auctionFilter["auction.currentPrice"] = {};

      if (minPrice) {
        auctionFilter["auction.currentPrice"].$gte =
          Number(minPrice);
      }

      if (maxPrice) {
        auctionFilter["auction.currentPrice"].$lte =
          Number(maxPrice);
      }
    }


    // Auction status
    if (auctionStatus) {
      auctionFilter["auction.status"] =
        auctionStatus;
    }


    // ==========================================
    // 3. PAGINATION
    // ==========================================

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const itemsPerPage = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );

    const skip =
      (currentPage - 1) * itemsPerPage;


    // ==========================================
    // 4. SORTING
    // ==========================================

    let sortOption = {
      createdAt: -1
    };


    switch (sort) {

      case "oldest":
        sortOption = {
          createdAt: 1
        };
        break;


      case "yearAsc":
        sortOption = {
          year: 1
        };
        break;


      case "yearDesc":
        sortOption = {
          year: -1
        };
        break;


      case "mileageAsc":
        sortOption = {
          mileage: 1
        };
        break;


      case "mileageDesc":
        sortOption = {
          mileage: -1
        };
        break;


      case "priceAsc":
        sortOption = {
          "auction.currentPrice": 1
        };
        break;


      case "priceDesc":
        sortOption = {
          "auction.currentPrice": -1
        };
        break;


      case "newest":
      default:
        sortOption = {
          createdAt: -1
        };
        break;
    }


    // ==========================================
    // 5. MONGODB AGGREGATION
    // ==========================================

    const pipeline = [

      // Filter cars first
      {
        $match: carFilter
      },


      // Connect cars with auctions
      {
        $lookup: {
          from: "auctions",
          localField: "_id",
          foreignField: "car",
          as: "auction"
        }
      },


      // Convert auction array into object
      {
        $unwind: {
          path: "$auction",
          preserveNullAndEmptyArrays: true
        }
      },


      // Apply auction filters
      {
        $match: auctionFilter
      },


      // Connect seller information
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller"
        }
      },


      // Convert seller array into object
      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true
        }
      },


      // Select fields we want to return
      {
        $project: {

          title: 1,
          brand: 1,
          model: 1,
          year: 1,
          mileage: 1,
          fuelType: 1,
          transmission: 1,
          description: 1,
          location: 1,
          images: 1,
          createdAt: 1,
          updatedAt: 1,

          seller: {
            _id: "$seller._id",
            name: "$seller.name",
            email: "$seller.email"
          },

          auction: {
            _id: "$auction._id",
            startingPrice: "$auction.startingPrice",
            currentPrice: "$auction.currentPrice",
            startDate: "$auction.startDate",
            endDate: "$auction.endDate",
            status: "$auction.status",
            winner: "$auction.winner"
          }
        }
      },


      // Sort
      {
        $sort: sortOption
      },


      // Pagination + total count
      {
        $facet: {

          data: [
            {
              $skip: skip
            },
            {
              $limit: itemsPerPage
            }
          ],

          totalCount: [
            {
              $count: "count"
            }
          ]
        }
      }
    ];


    // Execute aggregation
    const result =
      await Car.aggregate(pipeline);


    const cars =
      result[0]?.data || [];


    const total =
      result[0]?.totalCount[0]?.count || 0;


    // ==========================================
    // 6. RESPONSE
    // ==========================================

    res.json({

      count: cars.length,

      total,

      page: currentPage,

      limit: itemsPerPage,

      totalPages:
        Math.ceil(total / itemsPerPage),

      filters: {

        search:
          search || null,

        brand:
          brand || null,

        fuelType:
          fuelType || null,

        transmission:
          transmission || null,

        location:
          location || null,

        minYear:
          minYear || null,

        maxYear:
          maxYear || null,

        minMileage:
          minMileage || null,

        maxMileage:
          maxMileage || null,

        minPrice:
          minPrice || null,

        maxPrice:
          maxPrice || null,

        auctionStatus:
          auctionStatus || null,

        sort
      },

      cars
    });


  } catch (error) {

    console.error(
      "Get cars error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ==========================================
// GET ONE CAR
// INCLUDING AUCTION
// ==========================================

export const getCarById = async (req, res) => {
  try {

    const car =
      await Car.findById(req.params.id)
        .populate("seller", "name email")
        .lean();


    if (!car) {

      return res.status(404).json({
        message: "Car not found"
      });

    }


    // Find auction belonging to this car
    const auction =
      await Auction.findOne({
        car: car._id
      })
        .populate(
          "winner",
          "name email"
        )
        .lean();


    // Return car + auction
    res.json({

      ...car,

      auction:
        auction || null

    });


  } catch (error) {

    console.error(
      "Get car error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ==========================================
// UPDATE CAR
// ==========================================

export const updateCar = async (req, res) => {
  try {

    const car =
      await Car.findById(req.params.id);


    if (!car) {

      return res.status(404).json({
        message: "Car not found"
      });

    }


    // Only the seller can update the car
    if (
      car.seller.toString() !==
      req.user.userId
    ) {

      return res.status(403).json({
        message:
          "You are not allowed to update this car"
      });

    }


    const updatedCar =
      await Car.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );


    res.json({

      message:
        "Car updated successfully",

      car: updatedCar

    });


  } catch (error) {

    console.error(
      "Update car error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ==========================================
// DELETE CAR
// ==========================================

export const deleteCar = async (req, res) => {
  try {

    const car =
      await Car.findById(req.params.id);


    if (!car) {

      return res.status(404).json({
        message: "Car not found"
      });

    }


    // Only the seller can delete the car
    if (
      car.seller.toString() !==
      req.user.userId
    ) {

      return res.status(403).json({
        message:
          "You are not allowed to delete this car"
      });

    }


    await Car.findByIdAndDelete(
      req.params.id
    );


    res.json({

      message:
        "Car deleted successfully"

    });


  } catch (error) {

    console.error(
      "Delete car error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};
// ==========================================
// GET MY CARS
// ==========================================

export const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({
      seller: req.user.userId
    })
      .sort({
        createdAt: -1
      })
      .lean();

    res.json({
      count: cars.length,
      cars
    });
  } catch (error) {
    console.error(
      "Get my cars error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};