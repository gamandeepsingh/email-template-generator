const Template = require("../models/Template");

module.exports.getAllTemplate = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching templates", details: error.message });
  }
};
module.exports.createTemplate = async (req, res) => {
  try {

    if(!req.body.name || !req.body.subject || !req.body.body){
      return res.status(400).json({error: 'All fields are required'});
    }
    
    const template = new Template({
      name: req.body.name,
      subject: req.body.subject,
      body: req.body.body,
      folder: req.body.folder
    });
    const savedTemplate = await template.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating template", details: error.message });
  }
};

module.exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching template", details: error.message });
  }
};

module.exports.deleteTemplateById = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting template", details: error.message });
  }
};

module.exports.updateTemplateById = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Error updating template', details: error.message });
  }
}
