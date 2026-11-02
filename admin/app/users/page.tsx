"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Edit2, Ban, Trash2, X, Check } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable, { Column } from "../components/DataTable";
import { api } from "../lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  bio?: string;
  role: string;
  is_banned: boolean;
  posts_count: number;
  created_at: string;
  avatar_url?: string;
}

interface EditForm {
  username: string;
  email: string;
  nickname: string;
  bio: string;
  role: string;
}

const FILTERS = ["All", "Active", "Banned", "Admin"] as const;
type Filter = (typeof FILTERS)[number];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    username: "",
    email: "",
    nickname: "",
    bio: "",
    role: "user",
  });
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search ? { search } : {}),
        ...(filter !== "All"
          ? { filter: filter.toLowerCase() }
          : {}),
      });
      const res = await api.get<{
        data: User[];
        pagination: { totalPages: number };
      }>(`/api/admin/users?${params}`);
      setUsers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      nickname: user.nickname ?? "",
      bio: user.bio ?? "",
      role: user.role,
    });
  }

  async function saveEdit() {
    if (!editUser) return;
    setActionLoading(true);
    try {
      await api.put(`/api/admin/users/${editUser.id}`, editForm);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id ? { ...u, ...editForm } : u
        )
      );
      setEditUser(null);
    } catch {
      //
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBan(userId: string) {
    setActionLoading(true);
    try {
      await api.post(`/api/admin/users/${userId}/ban`, { reason: banReason });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: true } : u))
      );
      setBanUserId(null);
      setBanReason("");
    } catch {
      //
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnban(userId: string) {
    try {
      await api.post(`/api/admin/users/${userId}/unban`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: false } : u))
      );
    } catch {
      //
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Permanently delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      //
    }
  }

  const columns: Column<User>[] = [
    {
      key: "avatar",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          {u.avatar_url ? (
            <img
              src={u.avatar_url}
              alt={u.username}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {u.username?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-200">{u.username}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "posts_count",
      header: "Posts",
      render: (u) => (
        <span className="text-slate-300">{u.posts_count ?? 0}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            u.role === "admin"
              ? "bg-indigo-500/20 text-indigo-400"
              : "bg-slate-700 text-slate-400"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            u.is_banned
              ? "bg-red-500/15 text-red-400"
              : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {u.is_banned ? "Banned" : "Active"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      render: (u) => (
        <span className="text-slate-400 text-xs">
          {new Date(u.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (u) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {u.is_banned ? (
            <button
              onClick={() => handleUnban(u.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Unban"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setBanUserId(u.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Ban"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => handleDelete(u.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Users">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg text-slate-200 placeholder-slate-600 outline-none"
            style={{
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(71,85,105,0.5)",
            }}
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found"
      />

      {/* Edit Modal */}
      {editUser && (
        <Modal title={`Edit: ${editUser.username}`} onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            {(
              [
                { label: "Username", key: "username" },
                { label: "Email", key: "email" },
                { label: "Nickname", key: "nickname" },
                { label: "Bio", key: "bio" },
              ] as { label: string; key: keyof EditForm }[]
            ).map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {label}
                </label>
                {key === "bio" ? (
                  <textarea
                    value={editForm[key]}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 text-sm text-slate-200 outline-none resize-none"
                    style={{
                      background: "rgba(30,41,59,0.8)",
                      border: "1px solid rgba(71,85,105,0.5)",
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={editForm[key]}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="w-full rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
                    style={{
                      background: "rgba(30,41,59,0.8)",
                      border: "1px solid rgba(71,85,105,0.5)",
                    }}
                  />
                )}
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Role
              </label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, role: e.target.value }))
                }
                className="w-full rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
                style={{
                  background: "rgba(30,41,59,0.8)",
                  border: "1px solid rgba(71,85,105,0.5)",
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Ban Modal */}
      {banUserId && (
        <Modal title="Ban User" onClose={() => setBanUserId(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Ban Reason
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder="Reason for ban…"
                className="w-full rounded-lg px-3 py-2 text-sm text-slate-200 outline-none resize-none"
                style={{
                  background: "rgba(30,41,59,0.8)",
                  border: "1px solid rgba(71,85,105,0.5)",
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBanUserId(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBan(banUserId)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Banning…" : "Ban User"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{
          background: "rgba(15,23,42,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
