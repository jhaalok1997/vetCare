import AdminLayout from "@/components/Admin/layout"

const Adminlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}

export default Adminlayout