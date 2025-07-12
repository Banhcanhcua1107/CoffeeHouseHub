// src/pages/admin/RevenueChartPage.jsx

import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Sử dụng BarElement cho biểu đồ cột
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; // Đổi từ Line sang Bar
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

import AdminSidebar from '@/components/Admin/AdminSidebar';
import { ShopContext } from '@/components/context/ShopContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Component Card tóm tắt ---
const SummaryCard = ({ title, value, color, icon }) => (
  <motion.div 
    className={`bg-white p-5 rounded-xl border border-${color}-200 shadow-sm`}
    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-medium text-gray-500`}>{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
        </p>
      </div>
    </div>
  </motion.div>
);

function RevenueChartPage() {
  const { user } = useContext(ShopContext);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  
  // Sử dụng useMemo để tính toán các chỉ số
  const summaryStats = useMemo(() => {
    const data = chartData.datasets[0]?.data || [];
    if (data.length === 0) return { total: 0, average: 0, highest: 0 };

    const total = data.reduce((sum, value) => sum + value, 0);
    const daysWithRevenue = data.filter(value => value > 0);
    const average = daysWithRevenue.length > 0 ? total / daysWithRevenue.length : 0;
    const highest = Math.max(...data, 0);

    return { total, average, highest };
  }, [chartData]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://coffeehousehub-production.up.railway.app/api/admin/revenue`, {
          params: { year: selectedYear, month: selectedMonth }
        });
        
        const { dailyRevenue } = response.data;
        
        const labels = Object.keys(dailyRevenue);
        const data = Object.values(dailyRevenue);
        
        setChartData({
          labels: labels,
          datasets: [{
            label: 'Doanh thu',
            data: data,
            backgroundColor: 'rgba(129, 140, 248, 0.6)', // Màu indigo-400
            borderColor: 'rgba(129, 140, 248, 1)',
            borderWidth: 1,
            borderRadius: 5,
            hoverBackgroundColor: 'rgba(99, 102, 241, 0.8)', // Màu indigo-500
          }],
        });
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setChartData({ labels: [], datasets: [] }); // Reset data on error
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (increment) => {
    const newYear = selectedYear + increment;
    if (newYear <= currentYear) setSelectedYear(newYear);
  };

  const handleMonthChange = (month) => {
    if (selectedYear === currentYear && month > currentMonth) return;
    setSelectedMonth(month);
  };
  
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `BIỂU ĐỒ DOANH THU THÁNG ${selectedMonth}/${selectedYear}`,
        font: { size: 18, weight: 'bold', family: "'Inter', sans-serif" },
        color: '#374151',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        callbacks: {
          label: (context) => `Doanh thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Ngày', font: { size: 14, weight: '500' }, color: '#6B7280' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Doanh thu (VND)', font: { size: 14, weight: '500' }, color: '#6B7280' },
        ticks: {
          callback: (value) => {
            if (value >= 1000000) return `${value / 1000000}tr`;
            if (value >= 1000) return `${value / 1000}k`;
            return value;
          }
        }
      },
    },
  }), [selectedMonth, selectedYear]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <AdminSidebar user={user} />
          </div>

          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-center space-x-6 mb-8">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleYearChange(-1)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"><FaChevronLeft size={20} /></motion.button>
                  <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{selectedYear}</h2>
                  <motion.button whileHover={{ scale: selectedYear < currentYear ? 1.1 : 1 }} whileTap={{ scale: selectedYear < currentYear ? 0.9 : 1 }} onClick={() => handleYearChange(1)} disabled={selectedYear === currentYear} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"><FaChevronRight size={20} /></motion.button>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {months.map((month) => {
                    const isFuture = selectedYear === currentYear && month > currentMonth;
                    return (
                      <motion.button
                        key={month}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMonthChange(month)}
                        disabled={isFuture}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${selectedMonth === month ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'} ${isFuture ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Tháng {month}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SummaryCard title="Tổng doanh thu" value={summaryStats.total} color="indigo" icon={<i className="fas fa-dollar-sign"></i>} />
                    <SummaryCard title="Doanh thu TB/ngày" value={summaryStats.average} color="purple" icon={<i className="fas fa-chart-line"></i>} />
                    <SummaryCard title="Ngày cao nhất" value={summaryStats.highest} color="amber" icon={<i className="fas fa-arrow-trend-up"></i>} />
                </div>

                <div className="relative h-[450px] bg-gray-50 p-4 rounded-xl border">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                       <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    chartData.datasets.length > 0 ? 
                    <Bar options={chartOptions} data={chartData} /> :
                    <div className="flex items-center justify-center h-full text-gray-500">Không có dữ liệu cho tháng này.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueChartPage;