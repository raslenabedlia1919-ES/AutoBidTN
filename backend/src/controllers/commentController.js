import Comment from "../models/comment.js";
import Car from "../models/car.js";

// CREATE COMMENT
export const createComment = async (req, res) => {
  try {
    const { car, text } = req.body;

    if (!car || !text) {
      return res.status(400).json({
        message: "Please provide car and text"
      });
    }

    // Check if car exists
    const existingCar = await Car.findById(car);

    if (!existingCar) {
      return res.status(404).json({
        message: "Car not found"
      });
    }

    // Create comment
    const comment = await Comment.create({
      car,
      user: req.user.userId,
      text
    });

    // Return comment with user information
    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name email")
      .populate("car", "title brand model");

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment
    });

  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET COMMENTS FOR A CAR
export const getCarComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      car: req.params.carId
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: comments.length,
      comments
    });

  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Only the owner can delete the comment
    if (comment.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this comment"
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};