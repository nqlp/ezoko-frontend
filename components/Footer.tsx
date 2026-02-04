export default function Footer() {
    return (
        <footer className="w-full py-4 text-center text-sm text-(--ezoko-ink) absolute bottom-0">
            © {new Date().getFullYear()} EZOKO Fishing Inc. All rights reserved.
        </footer>
    );
}