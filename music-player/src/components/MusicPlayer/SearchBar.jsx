import React from 'react';


// SearchBar component for searching tracks
const SearchBar = ({ onSearch }) => {
    const [q, setQ] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState("");

    const doSearch = async () => {
        if (!q.trim()) return;
        setErr(""); setLoading(true);
        try { await onSearch(q.trim()); }
        catch (e) { setErr(typeof e?.message === "string" ? e.message : "Search failed"); }
        finally { setLoading(false); }
    };


    return (
        <div className="search-bar" style={{ display: "flex", gap: 8 }}>
        <input
            type="text"
            placeholder="Search a song …"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
            style={{ flex: 1, padding: 4 }}
        />
        <button onClick={doSearch} disabled={loading}>
            {loading ? "Searching …" : "Search"}
        </button>
        {err && <span style={{ color: "tomato", marginLeft: 8 }}>{err}</span>}
        </div>
    );
};

export default SearchBar;
