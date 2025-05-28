const { Course, Module } = require('../models');

exports.getAll = async (_,res)=>{
  const courses = await Course.findAll({ include: Module });
  res.json(courses);
};
exports.create = async (req,res)=>{
  const c = await Course.create(req.body);
  res.status(201).json(c);
};
// edit & delete serupa