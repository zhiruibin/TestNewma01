# !/usr/bin/env python3
"""
游戏启动脚本
自动清理端口并启动 Electron 游戏
"""

import subprocess
import sys
import os
import signal
import time


def find_process_on_port(port):
    """查找占用指定端口的进程 ID"""
    try:
        result = subprocess.run(
            ['lsof', '-ti', f':{port}'],
            capture_output=True,
            text=True
        )
        if result.stdout.strip():
            return result.stdout.strip().split('\n')
        return []
    except Exception as e:
        print(f"[错误] 查找端口进程失败：{e}")
        return []


def kill_process(pid):
    """终止指定进程"""
    try:
        os.kill(int(pid), signal.SIGKILL)
        print(f"[信息] 已终止进程 {pid}")
        return True
    except Exception as e:
        print(f"[警告] 终止进程 {pid} 失败：{e}")
        return False


def cleanup_port(port):
    """清理指定端口"""
    print(f"[信息] 检查端口 {port} 是否被占用...")
    pids = find_process_on_port(port)
    
    if pids:
        print(f"[警告] 端口 {port} 被以下进程占用：{pids}")
        for pid in pids:
            kill_process(pid)
        time.sleep(1)
        print(f"[信息] 端口 {port} 已清理")
    else:
        print(f"[信息] 端口 {port} 未被占用")
    
    return True



def start_game():
    """启动游戏"""
    print("\n" + "=" * 50)
    print("[信息] 开始启动游戏...")
    print("=" * 50 + "\n")
    
    # 确保在项目根目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"[信息] 工作目录：{script_dir}")
    
    # 启动命令
    cmd = ['npm', 'run', 'electron:dev']
    
    try:
        print(f"[信息] 执行命令：{' '.join(cmd)}")
        print("[信息] 游戏启动中，请稍候...\n")
        
        # 启动进程
        process = subprocess.Popen(
            cmd,
            stdout=sys.stdout,
            stderr=sys.stderr,
            stdin=sys.stdin
        )
        
        # 等待进程结束
        process.wait()
        
        if process.returncode == 0:
            print("\n[信息] 游戏已正常退出")
        else:
            print(f"\n[警告] 游戏退出，退出码：{process.returncode}")
        
        return process.returncode
        
    except KeyboardInterrupt:
        print("\n[信息] 用户中断启动")
        return 1
    except FileNotFoundError:
        print("[错误] 未找到 npm 命令，请确保已安装 Node.js")
        return 1
    except Exception as e:
        print(f"[错误] 启动失败：{e}")
        return 1


def main():
    """主函数"""
    print("\n" + "=" * 50)
    print("       俄罗斯方块游戏启动脚本")
    print("=" * 50 + "\n")
    
    # 配置
    PORT = 5173
    
    
    # 步骤 2: 清理端口
    cleanup_port(PORT)
    
    # 步骤 3: 启动游戏
    exit_code = start_game()
    
    # 步骤 4: 退出
    print("\n" + "=" * 50)
    print(f"[信息] 脚本执行完成，退出码：{exit_code}")
    print("=" * 50 + "\n")
    
    sys.exit(exit_code)


if __name__ == '__main__':
    main()