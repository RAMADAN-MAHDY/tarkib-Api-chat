import ClickCounter from '../models/ClickCounter.js';

export const handleButtonClick = async (req, res) => {
  const { buttonId } = req.body;

  if (!buttonId) {
    return res.status(400).json({ success: false, message: 'buttonId is required' });
  }

  try {
    const counter = await ClickCounter.findOneAndUpdate(
      { buttonId },
      { $inc: { clicks: 1 } },
      { new: true, upsert: true }
    );

    res.json({ success: true, clicks: counter.clicks });
  } catch (error) {
    console.error('Error updating counter:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// دالة لجلب عدد النقرات
export const getClickCount = async (req, res) => {
  const { buttonId } = req.params;

  if (!buttonId) {
    return res.status(400).json({ success: false, message: 'buttonId is required' });
  }

  try {
    const counter = await ClickCounter.findOne({ buttonId });

    if (!counter) {
      return res.json({ success: true, clicks: 0 }); // الزر مش موجود لسه، يعني صفر نقرات
    }

    res.json({ success: true, clicks: counter.clicks });
  } catch (error) {
    console.error('Error fetching counter:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};