import sqlite3, glob

for dbpath in glob.glob('**/*.db', recursive=True):
    print('Checking DB:', dbpath)
    try:
        conn = sqlite3.connect(dbpath)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='branches'")
        if cur.fetchone():
            print('  Found branches table in', dbpath)
            cur.execute("UPDATE branches SET image = '/doors/showroom_experience.jpg' WHERE branch_id = 'new-ikon-doors'")
            cur.execute("UPDATE branches SET image = '/doors/classic_ply_timber_warehouse.jpg' WHERE branch_id = 'classic-ply'")
            cur.execute("UPDATE branches SET image = '/doors/royal_lam_interior_showroom.jpg' WHERE branch_id = 'royal-lam'")
            conn.commit()
            print('  Updated branches in', dbpath)
            cur.execute("SELECT branch_id, name, image FROM branches")
            for row in cur.fetchall():
                print('   ', row)
        conn.close()
    except Exception as e:
        print('  Error:', e)
