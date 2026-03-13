export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} PropSite. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
