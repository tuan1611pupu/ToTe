import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, WalletCards as IdCard, Calendar, Save, X, Search, List, FileDown, ArrowLeft, CalendarPlus, Edit, Trash2, BarChart, UserPlus } from 'lucide-react';
function App() {
  const [currentStep, setCurrentStep] = useState('search'); // 'search', 'form', 'display', 'list'
  const [citizenId, setCitizenId] = useState('');
  const [formData, setFormData] = useState({
    citizenId: '',
    name: '',
    birthDate: '',
    createdAt: '',
    updatedAt: ''
  });
  const [existingData, setExistingData] = useState(null);
  const [allData, setAllData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const getStoredData = () => {
    const stored = localStorage.getItem('citizenData');
    return stored ? JSON.parse(stored) : {};
  };
  const saveToStorage = data => {
    const stored = getStoredData();
    stored[data.citizenId] = data;
    localStorage.setItem('citizenData', JSON.stringify(stored));
  };
  const handleSearch = () => {
    if (!citizenId.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số căn cước công dân",
        variant: "destructive"
      });
      return;
    }
    const stored = getStoredData();
    const found = stored[citizenId];
    if (found) {
      setExistingData(found);
      setCurrentStep('display');
      toast({
        title: "Tìm thấy thông tin",
        description: "Thông tin khách hàng đã có trong hệ thống"
      });
    } else {
      setFormData({
        citizenId,
        name: '',
        birthDate: '',
        createdAt: '',
        updatedAt: ''
      });
      setIsEditing(false);
      setCurrentStep('form');
      toast({
        title: "Thông tin mới",
        description: "Số căn cước chưa có, vui lòng nhập thông tin"
      });
    }
  };
  const handleSave = () => {
    if (!formData.name.trim() || !formData.birthDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }
    const newData = {
      ...formData,
      createdAt: isEditing ? formData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveToStorage(newData);
    toast({
      title: "Thành công",
      description: `Thông tin đã được ${isEditing ? 'cập nhật' : 'lưu'} thành công!`
    });
    setExistingData(newData);
    setCurrentStep('display');
    setIsEditing(false);
  };
  const handleReset = () => {
    setCitizenId('');
    setFormData({
      citizenId: '',
      name: '',
      birthDate: '',
      createdAt: '',
      updatedAt: ''
    });
    setExistingData(null);
    setAllData([]);
    setCurrentStep('search');
    setIsEditing(false);
    setSearchTerm('');
  };
  const handleViewAll = () => {
    const storedData = getStoredData();
    setAllData(Object.values(storedData).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setCurrentStep('list');
  };
  const handleEdit = customer => {
    setIsEditing(true);
    setFormData(customer);
    setCurrentStep('form');
  };
  const handleDeleteClick = id => {
    setDeleteTargetId(id);
    setIsDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    const stored = getStoredData();
    delete stored[deleteTargetId];
    localStorage.setItem('citizenData', JSON.stringify(stored));
    setAllData(Object.values(stored));
    setIsDeleteDialogOpen(false);
    setDeleteTargetId(null);
    toast({
      title: "Đã xóa",
      description: "Thông tin khách hàng đã được xóa."
    });
  };
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Chưa có thông tin nào để xuất.",
        variant: "destructive"
      });
      return;
    }
    const worksheetData = filteredData.map(item => ({
      "Số CCCD": item.citizenId,
      "Họ và Tên": item.name,
      "Ngày Sinh": new Date(item.birthDate).toLocaleDateString('vi-VN'),
      "Ngày Nhập": item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A',
      "Ngày Cập Nhật": item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : 'N/A'
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachKhachHang");
    XLSX.writeFile(workbook, "DanhSachKhachHang_TOTE.xlsx");
    toast({
      title: "Thành công",
      description: "Đã xuất file Excel thành công!"
    });
  };
  const filteredData = useMemo(() => allData.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.citizenId.includes(searchTerm)), [allData, searchTerm]);
  return <>
      <Helmet>
        <title>Quản lý thông tin khách hàng TOTE</title>
        <meta name="description" content="Hệ thống quản lý thông tin khách hàng TOTE - Hiện đại, nhanh chóng, hiệu quả." />
      </Helmet>
      
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
        <div className="absolute inset-0 -z-0 overflow-hidden">
          <motion.div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }} transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror"
        }} />
          <motion.div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
          rotate: [0, -180, -360]
        }} transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror"
        }} />
          <motion.div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" animate={{
          scale: [1, 1.3, 1]
        }} transition={{
          duration: 15,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror"
        }} />
        </div>

        <div className={`relative z-10 w-full transition-all duration-500 ${currentStep === 'list' ? 'max-w-5xl' : 'max-w-md'}`}>
          <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center mb-8">
            <motion.div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg" whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.95
          }}>
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quản lý thông tin khách hàng TOTE
            </h1>
            <p className="text-gray-300 mt-2"></p>
          </motion.div>

          <AnimatePresence mode="wait">
            {currentStep === 'search' && <motion.div key="search" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.9
          }} transition={{
            duration: 0.3
          }}>
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl mb-6">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><BarChart className="w-5 h-5 text-green-400" />Thống Kê Nhanh</CardTitle></CardHeader>
                    <CardContent><div className="flex justify-between items-center"><p className="text-gray-300">Tổng số khách hàng</p><p className="text-2xl font-bold text-white">{Object.keys(getStoredData()).length}</p></div></CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl">
                  <CardHeader className="text-center"><CardTitle className="text-white flex items-center justify-center gap-2"><Search className="w-5 h-5" />Tra Cứu Khách Hàng</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="citizenId" className="text-white">Số căn cước công dân</Label><Input id="citizenId" type="text" placeholder="Nhập số căn cước..." value={citizenId} onChange={e => setCitizenId(e.target.value)} className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-purple-400" onKeyPress={e => e.key === 'Enter' && handleSearch()} /></div>
                    <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"><Search className="w-4 h-4 mr-2" />Tìm Kiếm</Button>
                    <Button onClick={handleViewAll} variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 font-semibold py-3 rounded-lg transition-all duration-300"><List className="w-4 h-4 mr-2" />Xem Toàn Bộ Danh Sách</Button>
                  </CardContent>
                </Card>
              </motion.div>}

            {currentStep === 'form' && <motion.div key="form" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 20
          }} transition={{
            duration: 0.3
          }}>
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl">
                  <CardHeader className="text-center"><CardTitle className="text-white flex items-center justify-center gap-2">{isEditing ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}{isEditing ? 'Chỉnh Sửa Thông Tin' : 'Thêm Khách Hàng Mới'}</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2"><Label htmlFor="formCitizenId" className="text-white">Số căn cước công dân</Label><Input id="formCitizenId" type="text" value={formData.citizenId} disabled className="bg-gray-500/20 border-gray-400/30 text-gray-300" /></div>
                    <div className="space-y-2"><Label htmlFor="name" className="text-white">Họ và tên</Label><Input id="name" type="text" placeholder="Nhập họ và tên..." value={formData.name} onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-purple-400" /></div>
                    <div className="space-y-2"><Label htmlFor="birthDate" className="text-white">Ngày sinh</Label><Input id="birthDate" type="date" value={formData.birthDate} onChange={e => setFormData({
                    ...formData,
                    birthDate: e.target.value
                  })} className="bg-white/10 border-white/30 text-white focus:border-purple-400" /></div>
                    <div className="flex gap-3">
                      <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"><Save className="w-4 h-4 mr-2" />{isEditing ? 'Cập Nhật' : 'Lưu'}</Button>
                      <Button onClick={handleReset} variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10 font-semibold py-3 rounded-lg transition-all duration-300"><X className="w-4 h-4 mr-2" />Hủy</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>}

            {currentStep === 'display' && existingData && <motion.div key="display" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 20
          }} transition={{
            duration: 0.3
          }}>
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl">
                  <CardHeader className="text-center"><CardTitle className="text-white flex items-center justify-center gap-2"><Users className="w-5 h-5" />Thông Tin Khách Hàng</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10"><IdCard className="w-5 h-5 text-purple-400" /><div><p className="text-sm text-gray-400">Số căn cước</p><p className="text-white font-semibold">{existingData.citizenId}</p></div></div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10"><UserPlus className="w-5 h-5 text-green-400" /><div><p className="text-sm text-gray-400">Họ và tên</p><p className="text-white font-semibold">{existingData.name}</p></div></div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10"><Calendar className="w-5 h-5 text-blue-400" /><div><p className="text-sm text-gray-400">Ngày sinh</p><p className="text-white font-semibold">{new Date(existingData.birthDate).toLocaleDateString('vi-VN')}</p></div></div>
                    {existingData.createdAt && <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10"><CalendarPlus className="w-5 h-5 text-yellow-400" /><div><p className="text-sm text-gray-400">Ngày nhập</p><p className="text-white font-semibold">{new Date(existingData.createdAt).toLocaleDateString('vi-VN')}</p></div></div>}
                  </CardContent>
                  <CardFooter><Button onClick={handleReset} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">Tra Cứu Mới</Button></CardFooter>
                </Card>
              </motion.div>}

            {currentStep === 'list' && <motion.div key="list" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.9
          }} transition={{
            duration: 0.3
          }}>
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2"><List className="w-6 h-6" />Danh Sách Khách Hàng</CardTitle>
                    <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Tìm kiếm theo tên hoặc CCCD..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-purple-400 pl-10" /></div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto max-h-[50vh] rounded-lg border border-white/20">
                      <Table>
                        <TableHeader className="sticky top-0 bg-black/30 backdrop-blur-xl z-10"><TableRow><TableHead className="text-white font-semibold">Số CCCD</TableHead><TableHead className="text-white font-semibold">Họ và tên</TableHead><TableHead className="text-white font-semibold">Ngày sinh</TableHead><TableHead className="text-white font-semibold">Ngày nhập</TableHead><TableHead className="text-white font-semibold text-right">Hành động</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {filteredData.length > 0 ? filteredData.map(item => <TableRow key={item.citizenId} className="border-white/10 hover:bg-white/5">
                              <TableCell className="text-white font-medium">{item.citizenId}</TableCell>
                              <TableCell className="text-white">{item.name}</TableCell>
                              <TableCell className="text-white">{new Date(item.birthDate).toLocaleDateString('vi-VN')}</TableCell>
                              <TableCell className="text-white">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400" onClick={() => handleDeleteClick(item.citizenId)}><Trash2 className="w-4 h-4" /></Button>
                              </TableCell>
                            </TableRow>) : <TableRow><TableCell colSpan="5" className="text-center text-gray-400 h-24">Không tìm thấy kết quả hoặc chưa có dữ liệu.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-6">
                    <Button onClick={handleReset} variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold py-3 rounded-lg transition-all duration-300"><ArrowLeft className="w-4 h-4 mr-2" />Quay Lại</Button>
                    <Button onClick={handleExportExcel} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"><FileDown className="w-4 h-4 mr-2" />Xuất Excel</Button>
                  </CardFooter>
                </Card>
              </motion.div>}
          </AnimatePresence>
        </div>
        <Toaster />
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-800 border-purple-500 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">Hành động này không thể hoàn tác. Thông tin khách hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 hover:bg-gray-700">Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Xác Nhận Xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>;
}
export default App;