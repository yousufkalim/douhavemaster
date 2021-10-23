const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const status = require("http-status");
const Item = require("../../models/Item");
const Util = require("../../services/util");
const s3Service = require("../../services/s3");
const constant = require("../../config/constant");
const emailService = require("../../services/email");
const itemService = require("../../services/item");
const permGuard = require("../middleware/permissions-guard");
const itemCacheService = require("../../services/item-cache");

//Develop by Aashir Shahid
router.get("/search-products", (req, res, next) => {
  const regex = RegExp(req.query.term, "i");
  let obj = req.query;
  // Object.assign(obj, { description: req.query.category })
  Item.find({ ...obj, $or: [{ name: regex }, { description: regex }] })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});
// Get all items (paginated with lastId and limit).
router.get("/", async (req, res, next) => {
  // Getting the url query params
  let { lastId, limit = 30, category, zipCode, distance = "" } = req.query;

  // The projection fields.
  const projection =
    "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo";

  // The limit for the result.
  limit = parseInt(limit);

  // Build the query object.
  let query = {};
  if (category && category !== "all") query.category = category;
  if (lastId) query._id = { $lt: lastId };

  if (zipCode) {
    const zipCodes =
      (await itemService.getZipCodesAround(zipCode, distance).catch()) || [];
    if (zipCodes.length > 0) query.locationZip = { $in: zipCodes };
  }

  Item.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .select(projection)
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        lastId: docs.length > 0 ? docs[docs.length - 1]._id : "",
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            pic: doc.pic,
            budget: doc.budget,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      if (category && category !== "all") response.category = category;
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

// Category Routes

router.get("/:category", (req, res, next) => {
  let query = {};
  const category = req.params.category || "all";
  if (category && category !== "all") query = { category };

  Item.find(query)
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            budget: doc.budget,
            itemImg: doc.itemImg,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//GET All Items posted by User
router.get("/user/:userId", (req, res, next) => {
  Item.find({ submittedby1: req.params.userId })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            budget: doc.budget,
            itemImg: doc.itemImg,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

// End Category Routes

// Search Route: Category AND Name
router.get("/search1/:category/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({ category: req.params.category, name: regex })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            pic: doc.pic,
            budget: doc.budget,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//General Search: Name OR Description
router.get("/search2/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({ $or: [{ name: regex }, { description: regex }] })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//Advanced Search: Category AND Condition AND Name OR Description
router.get("/search3/:category/:condition/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({
    category: req.params.category,
    condition: req.params.condition,
    $or: [{ name: regex }, { description: regex }],
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//Advanced Search All Parameters: Category AND Condition AND State AND Name OR Description

router.get("/search4/:state/:category/:condition/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({
    locationState: req.params.state,
    category: req.params.category,
    condition: req.params.condition,
    $or: [{ name: regex }, { description: regex }],
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//Advanced Search State & Category: State AND Category AND Name OR Description

router.get("/search5/:state/:category/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({
    locationState: req.params.state,
    category: req.params.category,
    $or: [{ name: regex }, { description: regex }],
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//Advanced Search State: State AND Name OR Description

router.get("/search6/:state/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({
    locationState: req.params.state,
    $or: [{ name: regex }, { description: regex }],
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//Advanced Search Condition: Condition AND Name OR Description

router.get("/search7/:condition/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({
    condition: req.params.condition,
    $or: [{ name: regex }, { description: regex }],
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        success: true,
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

//Advanced Search State & Condition: State AND Condition AND Name OR Description

router.get("/search8/:state/:condition/:term", (req, res, next) => {
  const regex = RegExp(req.params.term, "i");
  Item.find({
    locationState: req.params.state,
    condition: req.params.condition,
    $or: [{ name: regex }, { description: regex }],
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//BEGIN ALL SEARCH ROUTES WITHOUT SEARCH TERM ----
//Advanced Search: Category AND Condition
router.get("/search3/:category/:condition", (req, res, next) => {
  Item.find({ category: req.params.category, condition: req.params.condition })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Advanced Search All Parameters: Category AND Condition AND State

router.get("/search4/:state/:category/:condition", (req, res, next) => {
  Item.find({
    locationState: req.params.state,
    category: req.params.category,
    condition: req.params.condition,
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Advanced Search State: State AND Category

router.get("/search5/:state/:category", (req, res, next) => {
  Item.find({ locationState: req.params.state, category: req.params.category })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Advanced Search State: State

router.get("/search6/:state", (req, res, next) => {
  Item.find({ locationState: req.params.state })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Advanced Search Condition: Condition

router.get("/search7/:condition", (req, res, next) => {
  Item.find({ condition: req.params.condition })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Advanced Search State: State AND Condition

router.get("/search8/:state/:condition", (req, res, next) => {
  Item.find({
    locationState: req.params.state,
    condition: req.params.condition,
  })
    .sort({ createdAt: -1 })
    .select(
      "name _id itemImg pic budget category condition description location locationState locationZip submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        items: docs.map((doc) => {
          return {
            name: doc.name,
            itemImg: doc.itemImg,
            budget: doc.budget,
            pic: doc.pic,
            _id: doc._id,
            category: doc.category,
            condition: doc.condition,
            description: doc.description,
            location: doc.location,
            locationState: doc.locationState,
            locationZip: doc.locationZip,
            submittedby: doc.submittedby,
            submittedby1: doc.submittedby1,
            carmake: doc.carmake,
            carmodel: doc.carmodel,
            caryear: doc.caryear,
            cellmake: doc.cellmake,
            cellmodel: doc.cellmodel,
            cellcarrier: doc.cellcarrier,
            cellos: doc.cellos,
            gamesystem: doc.gamesystem,
            createdAt: doc.createdAt,
            expirationDate: doc.expirationDate,
            contactinfo: doc.contactinfo,
            request: {
              type: "GET",
              url: "/items/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// End Search Route

/**
 * Creates or posts a new item in the listing database.
 */
router.post("/", permGuard.check(["USER", "ADMIN"]), (req, res, next) => {
  const item = new Item({
    name: req.body.name,
    itemImg: req.body.itemImg,
    budget: req.body.budget,
    category: req.body.category,
    condition: req.body.condition,
    description: req.body.description,
    location: req.body.location,
    locationState: req.body.locationState,
    locationZip: req.body.locationZip,
    submittedby:
      req.user.userName || req.user.firstName + " " + req.user.lastName,
    submittedby1: req.user.userId,
    carmake: req.body.carmake,
    carmodel: req.body.carmodel,
    caryear: req.body.caryear,
    cellcarrier: req.body.cellcarrier,
    cellmodel: req.body.cellmodel,
    cellmake: req.body.cellmake,
    cellos: req.body.cellos,
    gamesystem: req.body.gamesystem,
    contactinfo: req.body.contactinfo,
  });
  item
    .save()
    .then(async (result) => {
      // Caching the saved offer
      await itemCacheService.saveItem(result.toObject()).catch(Util.error);

      // Let's notify the admin before responding
      const postedDate = new Date(item.createdAt || Date.now());
      const postedDateFormatted =
        postedDate.toLocaleDateString() + " " + postedDate.toLocaleTimeString();
      const message =
        `Hi Team, \n\n` +
        `There’s a new item posted by ${req.user.email} on DoUHave.co App at ${postedDateFormatted}. \n` +
        `It’s called "${item.name}" of budget $${
          item.budget
        }, in the category ${item.category.toUpperCase()}. \n\n` +
        `Location: ${item.location}, ${item.locationState}. \n\n` +
        `Regards, \n` +
        `DoUHave Notifier Service.`;

      // Sending an email to the admins.
      const adminEmailResult = await emailService
        .sendEmail(
          `New Item: ${item.name}`,
          message,
          constant.notificationsReceivers
        )
        .catch();

      // Sending an email to the user who posted the new item.
      const newPostEmailResult = await emailService
        .sendEmail(
          `Fake title`,
          { itemTitle: item.name, itemBudget: item.budget },
          req.user.email,
          constant.DOUHAVE_POST_TEMPLATE
        )
        .catch();

      res.status(201).json({
        message: "Item created in /items",
        createdItem: {
          name: result.name,
          itemImg: result.itemImg,
          budget: result.budget,
          _id: result._id,
          category: result.category,
          condition: result.condition,
          description: result.description,
          location: result.location,
          locationState: result.locationState,
          locationzip: result.locationZip,
          submittedby: result.submittedby,
          submittedby1: result.submittedby1,
          carmake: result.carmake,
          carmodel: result.carmodel,
          caryear: result.caryear,
          cellmake: result.cellmake,
          cellmodel: result.cellmodel,
          cellcarrier: result.cellcarrier,
          cellos: result.cellos,
          gamesystem: result.gamesystem,
          createdAt: result.createdAt,
          expirationDate: result.expirationDate,
          contactinfo: result.contactinfo,
          request: {
            type: "POST",
            url: "/items/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

/*
router.post('/nopic', upload.none(), (req, res, next) => {
   const item = new Item({
    name: req.body.name,
    budget: req.body.budget,
    category: req.body.category,
    condition: req.body.condition,
    description: req.body.description,
    location: req.body.location,
    locationState: req.body.locationState,
    submittedby: req.body.submittedby,
    submittedby1: req.body.submittedby1,
    carmake: req.body.carmake,
    carmodel: req.body.carmodel,
    caryear: req.body.caryear,
    cellcarrier: req.body.cellcarrier,
    cellmodel: req.body.cellmodel,
    cellmake: req.body.cellmake,
    cellos: req.body.cellos,
    gamesystem: req.body.gamesystem,
    contactinfo: req.body.contactinfo
  });
  item.save()
      .then(result => {
         res.status(201).json({
          message: 'Item created in /items',
          createdItem: {
            name: result.name,
            itemImg: result.itemImg,
            budget: result.budget,
            _id: result._id,
            category: result.category,
            condition: result.condition,
            description: result.description,
            location: result.location,
            locationState: result.locationState,
            submittedby: result.submittedby,
            submittedby1: result.submittedby1,
            carmake: result.carmake,
            carmodel: result.carmodel,
            caryear: result.caryear,
            cellmake: result.cellmake,
            cellmodel: result.cellmodel,
            cellcarrier: result.cellcarrier,
            cellos: result.cellos,
            gamesystem: result.gamesystem,
            createdAt: result.createdAt,
            expirationDate: result.expirationDate,
            contactinfo: result.contactinfo,
            request: {
              type: 'POST',
              url: '/items/' + result._id
            }
          }
        });
      })
      .catch(err => {
       
        res.status(500).json({
          error: err
        })
      });
});
*/

router.get("/item/:itemId", async (req, res, next) => {
  const id = req.params.itemId;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid item id." });
  }

  // Looking for the item
  const item = await itemCacheService.readItem(id).catch(Util.error);
  if (item) {
    return res.status(200).json({
      success: true,
      item: item,
      request: {
        type: "GET",
        description: "Getting individual item",
        url: "/items/" + item._id,
      },
    });
  }

  Item.findById(id)
    .select(
      "name _id itemImg pic budget category condition description location locationState submittedby submittedby1 carmake carmodel caryear cellmake cellmodel cellcarrier cellos gamesystem createdAt expirationDate contactinfo"
    )
    .exec()
    .then(async (doc) => {
      if (doc) {
        await itemCacheService.saveItem(doc.toObject()).catch(Util.error);
        res.status(200).json({
          success: true,
          item: doc,
          request: {
            type: "GET",
            description: "Getting individual item",
            url: "/items/" + doc._id,
          },
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "No Valid Entry Found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

//EDIT ITEM
router.patch(
  "/item/edit/:itemId",
  permGuard.check(["USER", "ADMIN"]),
  (req, res, next) => {
    const id = req.params.itemId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item id." });
    }

    Item.findById(id)
      .select("submittedby1")
      .exec()
      .then((result) => {
        if (result.submittedby1 != req.user.userId) {
          return res.status(401).json({
            success: false,
            message: "Auth Failed 5",
          });
        } else {
          Item.update(
            { _id: id },
            {
              $set: {
                name: req.body.name,
                budget: req.body.budget,
                category: req.body.category,
                location: req.body.location,
                locationState: req.body.locationState,
                condition: req.body.condition,
                description: req.body.description,
                submittedby: req.body.submittedby,
              },
            }
          )
            .exec()
            .then(async (result) => {
              await itemCacheService
                .saveItem(result.toObject())
                .catch(Util.error);

              res.status(200).json({
                message: "Item updated!",
                request: {
                  type: "PATCH",
                  url: "/items/" + id,
                },
              });
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
);

router.delete(
  "/item/:itemId",
  permGuard.check(["USER", "ADMIN"]),
  (req, res, next) => {
    const id = req.params.itemId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item id." });
    }

    Item.findById(id)
      .select("submittedby1")
      .exec()
      .then((result) => {
        if (result.submittedby1 != req.user.userId) {
          return res.status(401).json({
            message: "Auth Failed 5",
          });
        } else {
          Item.remove({ _id: id })
            .exec()
            .then((result) => {
              res.status(200).json({
                message: "Item Deleted!",
                request: {
                  type: "DELETE",
                  url: "/items/",
                },
              });
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
);

/**
 * Getting the pre-signed URL from AWS-S3 image upload
 * The space is the purpose of the upload, the folder where to store the file (eg: itempics for items images)
 *
 * @name get/presigned_url/:space
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get(
  "/presigned_url/:space",
  permGuard.check(["USER", "ADMIN"]),
  async function (req, res) {
    const fileName = req.query.objectName;
    const fileType = req.query.contentType;
    const space = req.params.space || "itempics";
    const supportedImageFormats = ["image/png", "image/jpg", "image/jpeg"];

    if (!fileName || !fileType)
      return res
        .status(status.BAD_REQUEST)
        .json({
          success: false,
          message: "Bad parameters (file name and/or type)",
        });
    if (supportedImageFormats.indexOf(fileType) === -1)
      return res
        .status(status.BAD_REQUEST)
        .json({
          success: false,
          message: "Unsupported file type, only png and jpg are supported.",
        });

    const url = await s3Service.getPreSignedURL(fileName, fileType, space);

    res.status(status.OK).json({ success: true, signedUrl: url });
  }
);

module.exports = router;
